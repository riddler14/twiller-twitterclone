const { MongoClient,GridFSBucket,ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const nodemailer = require("nodemailer"); // For sending OTP emails
const multer = require("multer"); // For handling file uploads
const crypto = require("crypto"); // For generating OTPs
const { TwitterApi } = require("twitter-api-v2"); // Official Twitter API v2
// const  OpenAI = require("openai");
const rateLimit = require("express-rate-limit"); // OpenAI API
const { OpenAI } = require("openai"); // OpenAI library
const { GoogleGenerativeAI } = require("@google/generative-ai");

const url =
  "mongodb+srv://admin:admin@twitter.3aijc.mongodb.net/?retryWrites=true&w=majority&appName=twitter";
const port = 5000;


require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
// const parser = new Parser();

const client = new MongoClient(url);



// const TAGGBOX_API_URL = "https://api.taggbox.com/v1/widget";
// const TAGGBOX_API_KEY = process.env.TAGGBOX_API_KEY; // Store your Taggbox API key in .env
// const TAGGBOX_WIDGET_ID = process.env.TAGGBOX_WIDGET_ID; // Store your Taggbox widget ID in .env
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const userClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Initialize Bearer Token client (for app-only actions)
const appOnlyClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);


// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Add your API key in .env

// const globalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1, // Limit each IP to 1 request per windowMs
//   message: "Too many requests from this IP, please try again after 15 minutes",
// });

// User-specific rate limiter (1 request per 15 minutes per user)
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1, // Limit each user to 1 request per windowMs
  keyGenerator: (req) => {
    // Use the user's IP address or a unique identifier (e.g., email or user ID)
    return req.ip || req.query.email || "anonymous";
  },
  message: "Too many requests from this user, please try again after 15 minutes",
});

// app.use(globalLimiter);
// Function to scrape tweets using Puppeteer
async function fetchTweets(query) {
  try {
    // Step 1: Fetch tweets based on the query
    const tweetsResponse = await appOnlyClient.v2.search(query, {
      max_results: 10, // Fetch up to 10 tweets
      "tweet.fields": "created_at,author_id,public_metrics", // Include additional fields
      "user.fields": "name,username,profile_image_url", // Include user details
      expansions: "author_id", // Expand author_id to include user details
    });

    // Step 2: Extract tweets and included users
    const tweets = tweetsResponse.data.data;
    const users = tweetsResponse.includes.users;

    // Step 3: Format tweets in traditional format
    const formattedTweets = tweets.map((tweet) => {
      // Find the author details for this tweet
      const author = users.find((user) => user.id === tweet.author_id);

      return {
        id: tweet.id,
        text: tweet.text,
        author: {
          id: author.id,
          name: author.name,
          username: author.username,
          profile_image_url: author.profile_image_url,
        },
        date: tweet.created_at,
        metrics: {
          retweets: tweet.public_metrics.retweet_count,
          likes: tweet.public_metrics.like_count,
          replies: tweet.public_metrics.reply_count,
        },
      };
    });

    return formattedTweets;
  } catch (error) {
    console.error("Error fetching tweets:", error);
    throw error;
  }
}


// Function to generate a chatbot response using OpenAI API
// Function to generate chatbot response using OpenAI API (GPT-4)
// Function to generate chatbot response using OpenAI API
// async function generateChatbotResponse(query) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo", // Use GPT-3.5-turbo (free tier)
//       messages: [
//         {
//           role: "user",
//           content: query,
//         },
//       ],
//       max_tokens: 100, // Limit the response length
//     });

//     return response.choices[0].message.content.trim();
//   } catch (error) {
//     console.error("Error generating OpenAI response:", error);
//     throw error;
//   }
// }

async function generateResponse(query) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Use the Gemini Pro model
    const result = await model.generateContent(query);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}


const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit file size to 100MB
}).single("audio");

function isWithinPostingWindow() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const istTime = new Date(now.getTime() + istOffset);

  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();

  return hours === 10 && minutes >= 0 && minutes <= 30;
}
async function run() {
  try {
    await client.connect();
    console.log(`server running on port ${port}`);
    const database = client.db("database");

    const postcollection = client.db("database").collection("posts");
    const usercollection = client.db("database").collection("users");
    const otpCollection = client.db("database").collection("otps");// Collection to store OTPs 
    const bucket = new GridFSBucket(database, {
      bucketName: "audios", // Collection name for GridFS
    });

    app.post("/register", async (req, res) => {
      const user = req.body;

      if (!user.followCount) {
        user.followCount = 0;
      }
      
      const result = await usercollection.insertOne(user);
      res.send(result);
    });

    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const user = await usercollection.find({ email: email }).toArray();
      res.send(user);
    });
    app.post("/follow", async (req, res) => {
      const { followerEmail, followeeEmail } = req.body;
    
      if (!followerEmail || !followeeEmail) {
        return res.status(400).json({ error: "Both followerEmail and followeeEmail are required" });
      }
    
      try {
        // Fetch the follower and followee from the database
        const follower = await usercollection.findOne({ email: followerEmail });
        const followee = await usercollection.findOne({ email: followeeEmail });
    
        if (!follower || !followee) {
          return res.status(400).json({ error: "Follower or followee not found" });
        }
    
        // Check if the follower is already following the followee
        if (follower.following && follower.following.includes(followeeEmail)) {
          return res.status(400).json({ error: "You are already following this user" });
        }
    
        // Update the follower's `following` list
        await usercollection.updateOne(
          { email: followerEmail },
          { $push: { following: followeeEmail }, $inc: { followCount: 1 } }
        );
    
        // Update the followee's `followers` list
        await usercollection.updateOne(
          { email: followeeEmail },
          { $push: { followers: followerEmail } }
        );
    
        res.json({ message: "Follow successful" });
      } catch (error) {
        console.error("Error updating follow relationship:", error);
        res.status(500).json({ error: "Failed to update follow relationship" });
      }
    });

    // app.post("/post", async (req, res) => {
    //   const post = req.body;
    
    //   // Validate required fields
    //   if (!post.name || !post.username || !post.email || !post.post) {
    //     return res.status(400).json({ error: "Missing required fields" });
    //   }
    
    //   try {
    //     const result = await postcollection.insertOne(post);
    //     res.send(result);
    //   } catch (error) {
    //     console.error("Error inserting post:", error);
    //     res.status(500).json({ error: "Failed to post tweet" });
    //   }
    // });

    app.post("/post", async (req, res) => {
      const post = req.body;
    
      // Validate required fields
      if (!post.name || !post.username || !post.email || !post.post) {
        return res.status(400).json({ error: "Missing required fields" });
      }
    
      try {
        // Fetch the user's follow count
        const user = await usercollection.findOne({ email: post.email });
    
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }
    
        const followCount = user.followCount || 0;
        const now = new Date();
        const currentDate = now.toDateString();
    
        // Fetch the user's post history
        const postsToday = await postcollection
          .find({
            email: post.email,
            createdAt: { $gte: new Date(currentDate) },
          })
          .toArray();
    
        // Apply posting rules based on follow count
        if (followCount === 0) {
          // User doesn't follow anyone
          if (!isWithinPostingWindow()) {
            return res.status(400).json({
              error: "You can only post between 10:00 AM and 10:30 AM IST",
            });
          }
    
          if (postsToday.length > 0) {
            return res.status(400).json({ error: "You have already posted today" });
          }
        } else if (followCount <= 2) {
          // User follows 1-2 people
          if (postsToday.length >= 2) {
            return res.status(400).json({ error: "You can only post 2 times a day" });
          }
        }
    
        // Insert the post into the database
        const result = await postcollection.insertOne({
          ...post,
          createdAt: now,
        });
    
        res.send(result);
      } catch (error) {
        console.error("Error inserting post:", error);
        res.status(500).json({ error: "Failed to post tweet" });
      }
    });

    app.get("/following", async (req, res) => {
      const email = req.query.email;
    
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
    
      try {
        const user = await usercollection.findOne({ email: email });
    
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }
    
        const following = user.following || [];
        res.json({ following });
      } catch (error) {
        console.error("Error fetching following list:", error);
        res.status(500).json({ error: "Failed to fetch following list" });
      }
    });

    app.get("/followers", async (req, res) => {
      const email = req.query.email;
    
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
    
      try {
        const user = await usercollection.findOne({ email: email });
    
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }
    
        const followers = user.followers || [];
        res.json({ followers });
      } catch (error) {
        console.error("Error fetching followers list:", error);
        res.status(500).json({ error: "Failed to fetch followers list" });
      }
    });

    app.get("/post", async (req, res) => {
      const post = (await postcollection.find().toArray()).reverse();
      res.send(post);
    });

    app.get("/userpost", async (req, res) => {
      const email = req.query.email;
      const post = (
        await postcollection.find({ email: email }).toArray()
      ).reverse();
      res.send(post);
    });

    app.get("/user", async (req, res) => {
      const user = await usercollection.find().toArray();
      res.send(user);
    });

    app.patch("/userupdate/:email", async (req, res) => {
      const filter = req.params;
      const profile = req.body;
      const options = { upsert: true };
      const updateDoc = { $set: profile };
      const result = await usercollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.post("/send-otp", async (req, res) => {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const otp = crypto.randomBytes(3).toString("hex").toUpperCase(); // Generate a 6-character OTP
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_PASS, // Your Gmail password or App Password
        },
        debug: true, // Enable debugging

      });

      const mailOptions = {
        from: "Twiller-Support",
        to: email,
        subject: "Your OTP for Audio Upload",
        text: `Your OTP is: ${otp}. Please use this to verify your email.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        await otpCollection.updateOne(
          { email: email },
          { $set: { email: email, otp: otp, createdAt: new Date() } },
          { upsert: true }
        );
        res.json({ message: "OTP sent successfully" });
      } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Failed to send OTP" });
      }
    });

    // Endpoint to verify OTP
    app.post("/verify-otp", async (req, res) => {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
      }

      try {
        const storedOtp = await otpCollection.findOne({ email: email });

        if (!storedOtp || storedOtp.otp !== otp) {
          return res.status(400).json({ error: "Invalid OTP" });
        }

        const otpExpiryTime = new Date(storedOtp.createdAt.getTime() + 15 * 60 * 1000); // OTP valid for 15 minutes
        if (new Date() > otpExpiryTime) {
          return res.status(400).json({ error: "OTP has expired" });
        }

        await otpCollection.deleteOne({ email: email }); // Delete OTP after successful verification
        res.json({ success: true, message: "OTP verified successfully" });
      } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "Failed to verify OTP" });
      }
    });

    // Endpoint to upload audio using imgbb
    app.post("/upload-audio", (req, res) => {
      upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: "File too large. Maximum size is 100MB." });
        } else if (err) {
          return res.status(500).json({ error: "Error uploading file" });
        }
    
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
    
        const audioFile = req.file; // Uploaded file
    
        try {
          // Upload the file to GridFS
          const uploadStream = bucket.openUploadStream(audioFile.originalname, {
            contentType: audioFile.mimetype,
          });
    
          uploadStream.end(audioFile.buffer);
    
          // Wait for the upload to complete
          uploadStream.once("finish", () => {
            const audioId = uploadStream.id; // The ID of the uploaded file in GridFS
            console.log("Uploaded audio file with ID:", audioId); // Log the ID
            const audioUrl = `https://twiller-twitterclone-1-j9kj.onrender.com/audio/${audioId}`;
            res.json({ url: audioUrl, id: audioId });
          });
    
          uploadStream.on("error", (error) => {
            console.error("Error uploading audio to GridFS:", error);
            res.status(500).json({ error: "Failed to upload audio" });
          });
        } catch (error) {
          console.error("Error uploading audio:", error);
          res.status(500).json({ error: "Failed to upload audio" });
        }
      });
    });

    // Endpoint to retrieve audio from GridFS
  // Endpoint to retrieve audio from GridFS
app.get("/audio/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    // Validate the fileId
    if (!fileId || !ObjectId.isValid(fileId)) {
      console.error("Invalid file ID:", fileId);
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

    res.set("Content-Type", "audio/wav"); // Set the appropriate content type
    downloadStream.pipe(res);

    downloadStream.on("error", (error) => {
      console.error("Error retrieving audio from GridFS:", error);
      res.status(404).json({ error: "Audio not found" });
    });
  } catch (error) {
    console.error("Error retrieving audio from GridFS:", error);
    res.status(404).json({ error: "Audio not found" });
  }
});

    app.get("/tweets", userLimiter, async (req, res) => {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      try {
        const tweets = await fetchTweets(query);
        res.json({ tweets });
      } catch (error) {
        console.error("Error fetching tweets:", error);
        res.status(500).json({ error: "Failed to fetch tweets" });
      }
    });

    // Endpoint for chatbot interaction with user-specific rate limiting
    // app.post("/chatbot", userLimiter, async (req, res) => {
    //   const { query } = req.body;
    //   if (!query) {
    //     return res.status(400).json({ error: "Query is required" });
    //   }
    //   try {
    //     const chatbotResponse = await generateChatbotResponse(query);
    //     const tweets = await fetchTweets(query);
    //     res.json({ response: chatbotResponse, tweets });
    //   } catch (error) {
    //     console.error("Error in chatbot endpoint:", error);
    //     res.status(500).json({ error: "Failed to process request" });
    //   }
    // });

    app.post("/gemini", userLimiter, async (req, res) => {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      try {
        const geminiResponse = await generateResponse(query);
        const tweets = await fetchTweets(query);
        res.json({
          response: geminiResponse,
          tweets: tweets || [],
        });
      } catch (error) {
        console.error("Error in Gemini endpoint:", error);
        res.status(500).json({ error: "Failed to process request" });
      }
    });

    app.get("/search-users", async (req, res) => {
      const query = req.query.query; // Explicitly access the query parameter
      const loggedInUserEmail = req.query.email; 
      if (!query || typeof query !== "string" || query.trim() === "") {
        return res.status(400).json({ error: "Search query is required" });
      }
    
      try {
        // Perform a case-insensitive search on the 'name', 'username', and 'email' fields
        const users = await usercollection
          .find({
            $or: [
              { name: { $regex: query.trim(), $options: "i" } }, // Case-insensitive search on 'name'
              { username: { $regex: query.trim(), $options: "i" } }, // Case-insensitive search on 'username'
              { email: { $regex: query.trim(), $options: "i" } }, // Case-insensitive search on 'email'
            ],
            email: { $ne: loggedInUserEmail },
          })
          .project({
            name: 1, // Include 'name'
            username: 1, // Include 'username'
            profileImage: 1, // Include 'profileImage'
            email: 1, // Include 'email' for generating username if missing
            _id: 1, // Exclude '_id'
          })
          .limit(10) // Limit results to 10 profiles
          .toArray();
    
        // Ensure each user has a username (generate from email if missing)
        const formattedUsers = users.map((user) => ({
          ...user,
          username: user.username || user.email.split("@")[0], // Generate username from email if missing
        }));
    
        // Return the results
        res.json({ users: formattedUsers });
      } catch (error) {
        console.error("Error searching users:", error.message);
        res.status(500).json({ error: "Failed to fetch users" });
      }
    });

    app.get("/userprofile/:id", async (req, res) => {
      const userId = req.params.id;
    
      // Validate the ID
      if (!userId || !ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
    
      try {
        const user = await usercollection.findOne(
          { _id: new ObjectId(userId) },
          {
            projection: {
              _id: 1,
              name: 1,
              username: 1,
              email: 1,
              profileImage: 1,
              coverimage: 1,
              bio: 1,
              location:1,
            },
          }
        );
    
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
    
        res.json({ user }); // Wrap the user object in a response object
      } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Failed to fetch user profile" });
      }
    });


  } catch (error) {
    console.log(error);
  }
}

run().catch(console.dir);

app.get("/", (req,res) => {
  res.send("Twiller is working");
});

app.listen(port, () => {
  console.log(`Twiller clone is working on ${port}`);
});
