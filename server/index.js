const { MongoClient, GridFSBucket, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

const nodemailer = require("nodemailer"); // For sending OTP emails
const multer = require("multer"); // For handling file uploads
const crypto = require("crypto"); // For generating OTPs
const { TwitterApi } = require("twitter-api-v2"); // Official Twitter API v2
// const  OpenAI = require("openai");
const rateLimit = require("express-rate-limit"); // OpenAI API
// const { OpenAI } = require("openai"); // OpenAI library
const { GoogleGenerativeAI } = require("@google/generative-ai");
const http = require("http");
const { Server } = require("socket.io");
const twilio = require("twilio");
const url =
  "mongodb+srv://admin:admin@twitter.3aijc.mongodb.net/?retryWrites=true&w=majority&appName=twitter";
const port = 5000;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = twilio(accountSid, authToken);
const useragent = require("express-useragent");
const Razorpay = require("razorpay");
const cron = require("node-cron");
const moment = require("moment-timezone"); // Make sure to install: npm install moment-timezone
require("dotenv").config();

const app = express();
app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://twiller-clone.netlify.app"], // Add your frontend URLs here
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allow necessary HTTP methods
    credentials: true, // Enable cookies or authentication headers if needed
  })
);
app.use(express.json());
// const parser = new Parser();
app.use(useragent.express());

app.use((req, res, next) => {
  // Only apply this restriction to GET requests (when trying to display the website)
  // and if the request is from a mobile device.
  if (req.useragent.isMobile && req.method === "GET") {
    const now = moment().tz("Asia/Kolkata"); // Use 'Asia/Kolkata' for IST
    const currentHour = now.hour();

    // Allowed time window: 10 AM (hour 10) to 1 PM (hour 13, meaning up to 12:59:59)
    const isAllowedTime = currentHour >= 10 && currentHour < 13;
    console.log("Current IST Time (Full):", now.format());
    console.log("Current IST Hour:", currentHour);
    console.log("Is Allowed Time (10 AM - 1 PM IST):", isAllowedTime);
    console.log("User-Agent:", req.headers["user-agent"]);
    console.log("Is Mobile (useragent.isMobile):", req.useragent.isMobile);
    if (!isAllowedTime) {
      // If it's a mobile device and outside the allowed time, send a 403 Forbidden response
      console.log(
        `Mobile access restricted for ${
          req.ip
        } at ${now.format()} (outside 10 AM - 1 PM IST)`
      );
      return res.status(403).send(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Access Restricted</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                h1 { color: #d9534f; }
                p { color: #555; }
            </style>
        </head>
        <body>
            <h1>Access Restricted</h1>
            <p>Displaying the website on mobile devices is only allowed between 10 AM and 1 PM IST.</p>
            <p>Please try again during the allowed hours or access the website from a desktop device.</p>
        </body>
        </html>`
      );
    }
  }
  next(); // Allow the request to proceed if not restricted
});

const client = new MongoClient(url);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://twiller-clone.netlify.app", "http://localhost:3000"], // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

// Handle Socket.IO connections
// Handle Socket.IO connections
io.on("connection", (socket) => {
  // console.log("A user connected:", socket.id);

  // Extract and decode the email query parameter
  const userEmail = socket.handshake.query.email;

  if (!userEmail) {
    console.error("Email is missing in the query parameters.");
    return;
  }

  let decodedEmail;
  try {
    decodedEmail = decodeURIComponent(userEmail);
  } catch (error) {
    console.error("Failed to decode email:", error.message);
    return;
  }

  // Validate the email format
  if (!decodedEmail.includes("@")) {
    console.error("Invalid email format:", decodedEmail);
    return;
  }

  // console.log("Decoded email:", decodedEmail);

  // Join a room named after the user's email
  socket.join(decodedEmail);
  // console.log(`User ${decodedEmail} joined room: ${decodedEmail}`);

  // Handle disconnection
  socket.on("disconnect", () => {
    // console.log("A user disconnected:", socket.id);
  });
  socket.onopen = () => {
    // console.log("WebSocket connection established");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
  // Example: Listen for a custom event (e.g., "send-notification")
  socket.on("send-notification", (data) => {
    // console.log("Received notification data:", data);

    // Validate the recipient email
    const recipientEmail = data.recipientEmail;
    if (!recipientEmail || !recipientEmail.includes("@")) {
      console.error("Invalid recipient email:", recipientEmail);
      return;
    }

    // Emit the notification to the recipient's room
    io.to(recipientEmail).emit("notification", {
      title: data.title,
      body: data.body,
    });
  });
});

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
  message:
    "Too many requests from this user, please try again after 15 minutes",
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use the Gemini Pro model
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
const upload2 = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit file size to 100MB
}).single("video");
function isWithinPostingWindow() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const istTime = new Date(now.getTime() + istOffset);

  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();

  return hours === 10 && minutes >= 0 && minutes <= 30;
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const plans = {
  free: { price: 0, tweets: 1 },
  bronze: { price: 100, tweets: 3 },
  silver: { price: 300, tweets: 5 },
  gold: { price: 1000, tweets: Infinity },
};

// Helper function to check if payment is allowed
function isPaymentAllowed() {
  const now = new Date();

  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds

  const istTime = new Date(now.getTime() + istOffset);

  const hours = istTime.getUTCHours();

  const minutes = istTime.getUTCMinutes();

  return hours === 10 && minutes >= 0 && minutes <= 59; // Allow payments only between 10 AM to 11 AM IST // Allow payments only between 10 AM to 11 AM IST
}
async function run() {
  try {
    await client.connect();
    console.log(`server running on port ${port}`);
    const database = client.db("database");

    const postcollection = client.db("database").collection("posts"); // Collection to store posts
    const usercollection = client.db("database").collection("users");
    const otpCollection = client.db("database").collection("otps");
    const commentcollection = client.db("database").collection("comments"); // Collection to store OTPs
    const bucket = new GridFSBucket(database, {
      bucketName: "audios", // Collection name for GridFS
    });
    const bucket2 = new GridFSBucket(database, {
      bucketName: "videos", // Collection name for GridFS
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

    app.get("/login-history", async (req, res) => {
      const { email } = req.query;
      try {
        const user = await usercollection.findOne(
          { email: email },
          { projection: { loginHistory: 1 } }
        );
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json({ loginHistory: user.loginHistory });
      } catch (error) {
        console.error("Error fetching login history:", error);
        res.status(500).json({ error: "Failed to fetch login history." });
      }
    });
    app.post("/follow", async (req, res) => {
      const { followerEmail, followeeEmail } = req.body;

      if (!followerEmail || !followeeEmail) {
        return res
          .status(400)
          .json({ error: "Both followerEmail and followeeEmail are required" });
      }

      try {
        // Fetch the follower and followee from the database
        const follower = await usercollection.findOne({ email: followerEmail });
        const followee = await usercollection.findOne({ email: followeeEmail });

        if (!follower || !followee) {
          return res
            .status(400)
            .json({ error: "Follower or followee not found" });
        }

        // Check if the follower is already following the followee
        const isFollowing =
          follower.following && follower.following.includes(followeeEmail);

        if (isFollowing) {
          // Unfollow logic
          await usercollection.updateOne(
            { email: followerEmail },
            { $pull: { following: followeeEmail }, $inc: { followCount: -1 } }
          );

          await usercollection.updateOne(
            { email: followeeEmail },
            { $pull: { followers: followerEmail } }
          );

          return res.json({ message: "Unfollowed successfully" });
        } else {
          // Follow logic
          await usercollection.updateOne(
            { email: followerEmail },
            { $push: { following: followeeEmail }, $inc: { followCount: 1 } }
          );

          await usercollection.updateOne(
            { email: followeeEmail },
            { $push: { followers: followerEmail } }
          );

          return res.json({ message: "Followed successfully" });
        }
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
    //     const result = await commentcollection.insertOne(post);
    //     res.send(result);
    //   } catch (error) {
    //     console.error("Error inserting post:", error);
    //     res.status(500).json({ error: "Failed to post tweet" });
    //   }
    // });

    // app.post("/post", async (req, res) => {
    //   const post = req.body;

    //   // Validate required fields
    //   if (!post.name || !post.username || !post.email || !post.post) {
    //     return res.status(400).json({ error: "Missing required fields" });
    //   }

    //   try {
    //     // Fetch the user's follow count
    //     const user = await usercollection.findOne({ email: post.email });

    //     if (!user) {
    //       return res.status(400).json({ error: "User not found" });
    //     }

    //     const followCount = user.followCount || 0;
    //     const now = new Date();
    //     const currentDate = now.toDateString();

    //     // Fetch the user's post history
    //     const postsToday = await commentcollection
    //       .find({
    //         email: post.email,
    //         createdAt: { $gte: new Date(currentDate) },
    //       })
    //       .toArray();

    //     // Apply posting rules based on follow count
    //     if (followCount === 0) {
    //       // User doesn't follow anyone
    //       if (!isWithinPostingWindow()) {
    //         return res.status(400).json({
    //           error: "You can only post between 10:00 AM and 10:30 AM IST",
    //         });
    //       }

    //       if (postsToday.length > 0) {
    //         return res.status(400).json({ error: "You have already posted today" });
    //       }
    //     } else if (followCount <= 2) {
    //       // User follows 1-2 people
    //       if (postsToday.length >= 2) {
    //         return res.status(400).json({ error: "You can only post 2 times a day" });
    //       }
    //     }

    //     // Insert the post into the database
    //     const result = await commentcollection.insertOne({
    //       ...post,
    //       createdAt: now,
    //     });

    //     res.send(result);
    //   } catch (error) {
    //     console.error("Error inserting post:", error);
    //     res.status(500).json({ error: "Failed to post tweet" });
    //   }
    // });

    app.post("/post", async (req, res) => {
      const post = req.body;

      // Validate required fields
      const missingFields = [];
      if (!post.name) missingFields.push("name");
      if (!post.username) missingFields.push("username");
      if (!post.email) missingFields.push("email");
      if (!post.post) missingFields.push("post");

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: "Missing required fields",
          details: `The following fields are missing: ${missingFields.join(
            ", "
          )}`,
        });
      }

      try {
        // Fetch the user's subscription and follow count
        const user = await usercollection.findOne({ email: post.email });

        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }

        const { subscription } = user;
        const { plan, tweetLimit, tweetsPosted } = subscription || {};
        const followCount = user.followCount || 0;

        // Default values for free plan
        const defaultTweetLimit = 1; // Free plan allows 1 tweet per month
        const effectiveTweetLimit = tweetLimit || defaultTweetLimit;

        // Check monthly tweet limit
        if (tweetsPosted >= effectiveTweetLimit) {
          return res.status(403).json({
            error: `You have reached your monthly tweet limit for the ${
              plan || "free"
            } plan.`,
          });
        }

        const now = new Date();
        const currentDate = now.toDateString();

        // Fetch the user's post history for today
        const postsToday = await postcollection
          .find({
            email: post.email,
            createdAt: { $gte: new Date(currentDate) },
          })
          .toArray();

        // Helper function to check posting window
        const isWithinPostingWindow = () => {
          const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
          const istTime = new Date(now.getTime() + istOffset);

          const hours = istTime.getUTCHours();
          const minutes = istTime.getUTCMinutes();

          // Users who don't follow anyone can only post between 10:00 AM and 10:30 AM IST
          return hours === 10 && minutes >= 0 && minutes <= 30;
        };

        // Apply daily posting limits based on follow count
        let maxPostsPerDay = Infinity; // Default to unlimited posts
        if (followCount === 0) {
          // User doesn't follow anyone
          if (!isWithinPostingWindow()) {
            return res.status(400).json({
              error: "You can only post between 10:00 AM and 10:30 AM IST",
            });
          }
          maxPostsPerDay = 1; // Only 1 post per day
        } else if (followCount > 0 && followCount < 10) {
          // User follows 1–9 people
          maxPostsPerDay = followCount <= 2 ? 2 : 5; // Adjust limits as needed
        }

        // Enforce daily posting limits
        if (postsToday.length >= maxPostsPerDay) {
          return res.status(400).json({
            error: `You can only post ${maxPostsPerDay} times a day`,
          });
        }

        // Insert the post into the database
        const result = await postcollection.insertOne({
          ...post,
          createdAt: now,
        });

        // Increment the tweetsPosted count
        await usercollection.updateOne(
          { email: post.email },
          { $inc: { "subscription.tweetsPosted": 1 } }
        );

        // Check if the post contains the keywords "cricket" or "science"
        const lowerCasePost = post.post.toLowerCase();
        const keywords = ["cricket", "science"];
        const containsKeyword = keywords.some((keyword) =>
          lowerCasePost.includes(keyword)
        );

        if (containsKeyword) {
          // Fetch all users with notificationsEnabled set to true
          const usersWithNotifications = await usercollection
            .find({ notificationsEnabled: true })
            .toArray();

          // Send notifications to these users
          usersWithNotifications.forEach((user) => {
            if (user.email !== post.email) {
              io.emit(`notification-${user.email}`, {
                title: "New Post Alert!",
                body: `${post.name} posted: ${post.post}`,
              });
            }
          });
        }

        res.send(result);
      } catch (error) {
        console.error("Error inserting post:", error);
        res.status(500).json({ error: "Failed to post tweet" });
      }
    });

    // Add this new DELETE endpoint within the `run` function,
    // for example, after the existing `app.post("/post", ...)` endpoint
    // or with other post-related routes.

    app.delete("/post/:id", async (req, res) => {
      const postId = req.params.id;

      if (!postId) {
        return res.status(400).json({ error: "Post ID is required" });
      }

      try {
        // Validate if the provided ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(postId)) {
          return res.status(400).json({ error: "Invalid Post ID format" });
        }

        const result = await postcollection.deleteOne({
          _id: new ObjectId(postId),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Post not found" });
        }

        res.json({
          message: "Post deleted successfully",
          deletedCount: result.deletedCount,
        });
      } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Failed to delete post" });
      }
    });

    // ... rest of your existing code ...
    app.post("/comment", async (req, res) => {
      const post = req.body; // Validate required fields

      const missingFields = [];
      if (!post.name) missingFields.push("name");
      if (!post.username) missingFields.push("username");
      if (!post.email) missingFields.push("email");
      if (!post.post) missingFields.push("post");

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: "Missing required fields",
          details: `The following fields are missing: ${missingFields.join(
            ", "
          )}`,
        });
      }

      try {
        // Fetch the user's subscription and follow count
        const user = await usercollection.findOne({ email: post.email });

        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }

        const { subscription } = user; // Assuming tweetLimit and tweetsPosted apply to comments as well
        const { plan, tweetLimit, tweetsPosted } = subscription || {};
        const followCount = user.followCount || 0; // Default values for free plan

        const defaultTweetLimit = 1; // Free plan allows 1 tweet/comment per month
        const effectiveTweetLimit = tweetLimit || defaultTweetLimit; // Check monthly comment limit

        if (tweetsPosted >= effectiveTweetLimit) {
          return res.status(403).json({
            error: `You have reached your monthly comment limit for the ${
              plan || "free"
            } plan.`,
          });
        }

        const now = new Date();
        const currentDate = now.toDateString(); // Fetch the user's comment history for today

        const commentsToday = await commentcollection
          .find({
            email: post.email,
            createdAt: { $gte: new Date(currentDate) },
          })
          .toArray(); // Helper function to check posting window

        const isWithinPostingWindow = () => {
          const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
          const istTime = new Date(now.getTime() + istOffset);

          const hours = istTime.getUTCHours();
          const minutes = istTime.getUTCMinutes(); // Check if the time is between 10:00 AM and 10:30 AM IST

          return hours === 10 && minutes >= 0 && minutes <= 30;
        }; // Apply daily posting limits based on follow count

        let maxCommentsPerDay = Infinity; // Default to unlimited comments
        if (followCount === 0) {
          // User doesn't follow anyone
          if (!isWithinPostingWindow()) {
            return res.status(400).json({
              error: "You can only comment between 10:00 AM and 10:30 AM IST",
            });
          }
          maxCommentsPerDay = 1; // Only 1 comment per day
        } else if (followCount > 0 && followCount < 10) {
          // User follows 1–9 people
          maxCommentsPerDay = followCount <= 2 ? 2 : 5; // Adjust limits as needed
        } // Enforce daily posting limits

        if (commentsToday.length >= maxCommentsPerDay) {
          return res.status(400).json({
            error: `You can only post ${maxCommentsPerDay} comments a day`,
          });
        } // Insert the comment into the database

        const result = await commentcollection.insertOne({
          ...post,
          createdAt: now,
        }); // Increment the tweetsPosted count (assuming comments contribute to the same limit)

        await usercollection.updateOne(
          { email: post.email },
          { $inc: { "subscription.tweetsPosted": 1 } }
        ); // Check if the comment contains the keywords "cricket" or "science"

        const lowerCasePost = post.post.toLowerCase();
        const keywords = ["cricket", "science"];
        const containsKeyword = keywords.some((keyword) =>
          lowerCasePost.includes(keyword)
        );

        if (containsKeyword) {
          // Fetch all users with notificationsEnabled set to true
          const usersWithNotifications = await usercollection
            .find({ notificationsEnabled: true })
            .toArray(); // Send notifications to these users

          usersWithNotifications.forEach((user) => {
            if (user.email !== post.email) {
              // Emit an event to notify the frontend
              io.emit(`notification-${user.email}`, {
                title: "New Comment Alert!",
                body: `${post.name} commented: ${post.post}`,
              });
            }
          });
        }
        res.send(result);
      } catch (error) {
        console.error("Error inserting comment:", error);
        res.status(500).json({ error: "Failed to post comment" });
      }
    });

    app.get("/comments", async (req, res) => {
      const { postId } = req.query; // Extract postId from the query parameters

      try {
        // Validate postId
        if (!postId) {
          return res.status(400).json({ error: "postId is required." });
        }

        // Fetch comments where postId matches
        const comments = await commentcollection.find({ postId }).toArray();

        // Return the comments as a JSON response
        res.json({ comments });
      } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Failed to fetch comments." });
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
    app.get("/comment", async (req, res) => {
      const post = (await commentcollection.find().toArray()).reverse();
      res.send(post);
    });
    app.get("/userpost", async (req, res) => {
      const email = req.query.email;
      const post = (
        await postcollection.find({ email: email }).toArray()
      ).reverse();
      res.send(post);
    });
    app.get("/usercomment", async (req, res) => {
      const email = req.query.email;
      const post = (
        await commentcollection.find({ email: email }).toArray()
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

        const otpExpiryTime = new Date(
          storedOtp.createdAt.getTime() + 15 * 60 * 1000
        ); // OTP valid for 15 minutes
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
          return res
            .status(400)
            .json({ error: "File too large. Maximum size is 100MB." });
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
            const audioUrl = `https://twiller-twitterclone-2-q41v.onrender.com/audio/${audioId}`;
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
              location: 1,
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

    app.get("/userprofile", async (req, res) => {
      const { email } = req.query;

      // Validate the email
      if (!email || typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({ error: "Invalid email" });
      }

      try {
        const user = await usercollection.findOne(
          { email: email },
          {
            projection: {
              _id: 1,
              profileImage: 1,
              name: 1,
              username: 1,
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

    // Endpoint to update notification preference

    // Endpoint to get the user's notification preference
    app.get("/get-notification-preference/:email", async (req, res) => {
      const { email } = req.params;

      try {
        const user = await usercollection.findOne({ email: email });
        if (!user) {
          return res.status(404).json({ error: "User not found." });
        }

        // Return the user's notification preference
        res.json({
          success: true,
          notificationsEnabled: user.notificationsEnabled || false,
        });
      } catch (error) {
        console.error("Error fetching notification preference:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch notification preference." });
      }
    });
    app.patch("/update-notification-preference/:email", async (req, res) => {
      const { email } = req.params; // Extract email from URL parameters
      const { notificationsEnabled } = req.body; // Extract new notification preference from request body

      try {
        // Find the user by email
        const user = await usercollection.findOne({ email: email });

        if (!user) {
          return res.status(404).json({ error: "User not found." });
        }

        // Update the user's notification preference
        const result = await usercollection.updateOne(
          { email: email },
          { $set: { notificationsEnabled: notificationsEnabled } }
        );

        if (result.modifiedCount > 0 || result.matchedCount > 0) {
          // Successfully updated or added the field
          res.json({
            success: true,
            message: "Notification preference updated.",
          });
        } else {
          res
            .status(500)
            .json({ error: "Failed to update notification preference." });
        }
      } catch (error) {
        console.error("Error updating notification preference:", error);
        res
          .status(500)
          .json({ error: "Failed to update notification preference." });
      }
    });

    // Endpoint to send OTP for password reset

    // Endpoint to reset password
    app.post("/check-reset-permission", async (req, res) => {
      const { email } = req.body;

      // Validate email
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      try {
        // Check if the user exists in the database
        const user = await usercollection.findOne({ email });
        if (!user) {
          return res.status(404).json({ error: "User not found." });
        }

        // Define the current timestamp
        const now = new Date();

        // Check if the user has already requested a reset email in the last 24 hours
        const lastResetRequest = user.lastResetRequest; // Timestamp of the last reset request
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (lastResetRequest && now - new Date(lastResetRequest) < oneDayInMs) {
          return res.status(400).json({
            allowed: false,
            error: "You can only request one password reset email per day.",
          });
        }

        // Allow the reset email request and update the timestamp
        await usercollection.updateOne(
          { email },
          { $set: { lastResetRequest: now } }
        );

        res.json({ allowed: true });
      } catch (error) {
        console.error(
          "Error checking reset permission:",
          error.message || error
        );
        res.status(500).json({ error: "Failed to check reset permission." });
      }
    });

    // Endpoint to send OTP via email
    app.post("/send-email-otp", async (req, res) => {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const otp = crypto.randomBytes(3).toString("hex").toUpperCase(); // Generate a 6-character OTP
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: "Twiller-Support",
        to: email,
        subject: "Your OTP for Email Verification for French Language",
        text: `Your OTP is: ${otp}. Please use this to verify your email.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        await otpCollection.updateOne(
          { email: email },
          { $set: { email: email, otp: otp, createdAt: new Date() } },
          { upsert: true }
        );
        res.json({ message: "Email OTP sent successfully" });
      } catch (error) {
        console.error("Error sending email OTP:", error);
        res.status(500).json({ error: "Failed to send email OTP" });
      }
    });

    // Endpoint to send OTP via SMS using Twilio
    // Endpoint to send OTP via SMS using Twilio
    app.post("/send-sms-otp", async (req, res) => {
      const { phoneNumber } = req.body;

      if (!phoneNumber || !/^\+\d{10,15}$/.test(phoneNumber)) {
        return res.status(400).json({ error: "Invalid phone number format" });
      }

      // Generate a 6-digit OTP
      const otp = crypto.randomBytes(3).toString("hex").toUpperCase();

      try {
        // Send the OTP via Twilio SMS
        await twilioClient.messages.create({
          body: `Your OTP is: ${otp}. Please use this to verify your phone number.`,
          from: twilioPhoneNumber,
          to: phoneNumber,
        });

        // Store the OTP in the database
        await otpCollection.updateOne(
          { phoneNumber: phoneNumber },
          {
            $set: { phoneNumber: phoneNumber, otp: otp, createdAt: new Date() },
          },
          { upsert: true }
        );

        res.json({ message: "OTP sent successfully" });
      } catch (error) {
        console.error("Error sending SMS OTP:", error);
        res.status(500).json({ error: "Failed to send OTP" });
      }
    });

    // Endpoint to verify OTP
    app.post("/verify-sms-otp", async (req, res) => {
      const { email, phoneNumber, otp } = req.body;

      if ((!email && !phoneNumber) || !otp) {
        return res
          .status(400)
          .json({ error: "Email/Phone and OTP are required" });
      }

      try {
        let storedOtp;
        if (email) {
          // Verify OTP for email
          storedOtp = await otpCollection.findOne({ email: email });
        } else if (phoneNumber) {
          // Verify OTP for phone number
          storedOtp = await otpCollection.findOne({ phoneNumber: phoneNumber });
        }

        if (!storedOtp || storedOtp.otp !== otp) {
          return res.status(400).json({ error: "Invalid OTP" });
        }

        const otpExpiryTime = new Date(
          storedOtp.createdAt.getTime() + 15 * 60 * 1000
        ); // OTP valid for 15 minutes
        if (new Date() > otpExpiryTime) {
          return res.status(400).json({ error: "OTP has expired" });
        }

        // Delete OTP after successful verification
        if (email) {
          await otpCollection.deleteOne({ email: email });
        } else if (phoneNumber) {
          await otpCollection.deleteOne({ phoneNumber: phoneNumber });
        }

        res.json({ success: true, message: "OTP verified successfully" });
      } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "Failed to verify OTP" });
      }
    });
    app.post("/send-chrome-otp", async (req, res) => {
      const { email } = req.body;

      // Validate email format
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      try {
        // Check if the user exists in the "users" database
        const user = await usercollection.findOne({ email: email });
        if (!user) {
          return res
            .status(404)
            .json({ error: "User not found. Please register first." });
        }

        // Generate a 6-character OTP
        const otp = crypto.randomBytes(3).toString("hex").toUpperCase();

        // Configure Nodemailer transporter
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // Email content
        const mailOptions = {
          from: "Twiller-Support",
          to: email,
          subject: "Your OTP for Email Verification for Chrome Browser",
          text: `Your OTP is: ${otp}. Please use this to verify your email.`,
        };

        // Send the OTP email
        await transporter.sendMail(mailOptions);

        // Store the OTP in the database
        await otpCollection.updateOne(
          { email: email },
          { $set: { email: email, otp: otp, createdAt: new Date() } },
          { upsert: true }
        );

        // Respond with success message
        res.json({ message: "Email OTP sent successfully" });
      } catch (error) {
        console.error("Error sending email OTP:", error);
        res.status(500).json({ error: "Failed to send email OTP" });
      }
    });

    app.post("/verify-chrome-otp", async (req, res) => {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
      }

      try {
        // Find the stored OTP in the database
        const storedOtp = await otpCollection.findOne({ email: email });

        if (!storedOtp || storedOtp.otp !== otp) {
          return res.status(400).json({ error: "Invalid OTP" });
        }

        // Check if the OTP has expired (15 minutes validity)
        const otpExpiryTime = new Date(
          storedOtp.createdAt.getTime() + 15 * 60 * 1000
        );
        if (new Date() > otpExpiryTime) {
          return res.status(400).json({ error: "OTP has expired" });
        }

        // Delete the OTP after successful verification
        await otpCollection.deleteOne({ email: email });

        // Return success response
        res.json({ success: true, message: "OTP verified successfully" });
      } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "Failed to verify OTP" });
      }
    });
    app.post("/store-login-metadata", async (req, res) => {
      const { email, metadata } = req.body;

      if (!email || !metadata) {
        return res
          .status(400)
          .json({ error: "Email and metadata are required" });
      }

      try {
        // Update the user's login history in the database
        const result = await usercollection.updateOne(
          { email: email },
          {
            $push: {
              loginHistory: {
                timestamp: new Date(),
                ip: metadata.ip,
                browser: metadata.browser,
                os: metadata.os,
                device: metadata.device,
              },
            },
          }
        );

        if (result.modifiedCount > 0 || result.matchedCount > 0) {
          res.json({
            success: true,
            message: "Login metadata stored successfully",
          });
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (error) {
        console.error("Error storing login metadata:", error);
        res.status(500).json({ error: "Failed to store login metadata" });
      }
    });
    app.post("/upload-video", (req, res) => {
      upload2(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          // Handle Multer errors (e.g., file too large)
          return res
            .status(400)
            .json({ error: "File too large. Maximum size is 500MB." });
        } else if (err) {
          // Handle other errors
          return res.status(500).json({ error: "Error uploading file" });
        }

        // Check if a file was uploaded
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const videoFile = req.file; // Uploaded file

        try {
          // Upload the file to GridFS
          const uploadStream = bucket2.openUploadStream(
            videoFile.originalname,
            {
              contentType: videoFile.mimetype,
            }
          );

          uploadStream.end(videoFile.buffer);

          // Wait for the upload to finish
          uploadStream.once("finish", () => {
            const videoId = uploadStream.id; // The ID of the uploaded file in GridFS
            console.log("Uploaded video file with ID:", videoId); // Log the ID

            // Construct the video URL
            const videoUrl = `https://twiller-twitterclone-2-q41v.onrender.com/video/${videoId}`;

            // Respond with the video URL and ID
            res.json({ url: videoUrl, id: videoId });
          });

          // Handle errors during upload
          uploadStream.on("error", (error) => {
            console.error("Error uploading video to GridFS:", error);
            res.status(500).json({ error: "Failed to upload video" });
          });
        } catch (error) {
          console.error("Error uploading video:", error);
          res.status(500).json({ error: "Failed to upload video" });
        }
      });
    });
    // Endpoint to store login metadata after successful login
    // Endpoint to retrieve video from GridFS
    app.get("/video/:id", async (req, res) => {
      const fileId = req.params.id;

      try {
        // Validate the fileId
        if (!fileId || !ObjectId.isValid(fileId)) {
          console.error("Invalid file ID:", fileId);
          return res.status(400).json({ error: "Invalid file ID" });
        }
        const files = await bucket2
          .find({ _id: new ObjectId(fileId) })
          .toArray();
        if (!files || files.length === 0) {
          return res.status(404).json({ error: "Video not found" });
        }

        const videoSize = files[0].length; // Total size of the video file

        // Handle range requests
        const range = req.headers.range;
        if (!range) {
          console.error("No range header found.");
          return res.status(400).json({ error: "Range header required" });
        }

        // Parse the range header
        const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
        const start = parseInt(startStr, 10);
        const end = endStr
          ? parseInt(endStr, 10)
          : Math.min(start + 10 ** 6, videoSize - 1); // Default chunk size: 1MB

        // Validate the range
        if (start >= videoSize || end >= videoSize) {
          return res.status(416).json({ error: "Range not satisfiable" });
        }

        // Set headers for range request
        const contentLength = end - start + 1;
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "video/mp4", // Adjust based on your video format
        });

        // Open a download stream for the video file
        const downloadStream = bucket2.openDownloadStream(
          new ObjectId(fileId),
          { start, end }
        );
        downloadStream.pipe(res);

        downloadStream.on("error", (error) => {
          console.error("Error downloading video from GridFS:", error);
          res.status(500).json({ error: "Failed to retrieve video" });
        });
      } catch (error) {
        console.error("Error retrieving video:", error);
        res.status(500).json({ error: "Failed to retrieve video" });
      }
    });
    // Endpoint to fetch a single post by ID
    app.get("/post/:id", async (req, res) => {
      const postId = req.params.id; // Extract the post ID from the URL

      try {
        // Validate the post ID
        if (!ObjectId.isValid(postId)) {
          return res.status(400).json({ error: "Invalid post ID format." });
        }

        // Fetch the post by ID from the database
        const post = await postcollection.findOne({
          _id: new ObjectId(postId),
        });

        if (!post) {
          // If no post is found, return a 404 error
          return res.status(404).json({ error: "Post not found." });
        }

        // Return the post as a JSON response
        res.json({ post });
      } catch (error) {
        // Handle any errors during the process
        console.error("Error fetching post:", error);
        res.status(500).json({ error: "Failed to fetch post." });
      }
    });
    app.get("/comments/:id", async (req, res) => {
      const postId = req.params.id; // Extract postId from the query parameters

      try {
        // Validate postId
        if (!postId) {
          return res.status(400).json({ error: "postId is required." });
        }

        // Fetch comments where postId matches
        const comments = await commentcollection
          .find({ author: postId })
          .toArray();
        if (!comments) {
          // If no post is found, return a 404 error
          return res.status(404).json({ error: "Comments not found." });
        }
        // Return the comments as a JSON response
        res.json({ comments });
      } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Failed to fetch comments." });
      }
    });
    app.post("/subscribe", async (req, res) => {
      const { email, plan } = req.body;

      // Validate input
      if (!email || !plan) {
        return res.status(400).json({ error: "Email and plan are required" });
      }

      // Check if payment is allowed at this time
      if (!isPaymentAllowed()) {
        return res.status(400).json({
          error: "Payments are only allowed between 10 AM to 11 AM IST",
        });
      }

      // Validate the selected plan
      const normalizedPlan = plan.toLowerCase().trim();

      const selectedPlan = plans[normalizedPlan];
      if (!selectedPlan) {
        return res.status(400).json({ error: "Invalid plan selected" });
      }

      try {
        // Create a Razorpay order
        const user = await usercollection.findOne({ email: email });

        if (user.subscription && user.subscription.plan) {
          return res.status(400).json({
            error: "Already subscribed to a plan",
          });
        }
        const options = {
          amount: selectedPlan.price * 100, // Amount in paise (₹1 = 100 paise)
          currency: "INR",
          receipt: crypto.randomBytes(10).toString("hex"), // Generate a unique receipt ID
          notes: {
            email: email,
            plan: normalizedPlan,
          },
        };

        const order = await razorpay.orders.create(options);

        // Respond with the order details
        res.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID, // Pass the Razorpay key ID to the frontend
        });
      } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: "Failed to create Razorpay order" });
      }
    });
    app.post(
      "/razorpay-webhook",
      express.raw({ type: "application/json" }),
      async (req, res) => {
        try {
          const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
          const signature = req.headers["x-razorpay-signature"];
          const body = req.body;

          // Verify the webhook signature
          const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(JSON.stringify(body))
            .digest("hex");

          if (generatedSignature !== signature) {
            console.error("Webhook signature verification failed");
            return res.status(400).json({ error: "Invalid webhook signature" });
          }
          console.log("Webhook Payload:", body);

          // Handle successful payment
          if (body.event === "payment.captured") {
            const payment = body.payload.payment.entity;
            const email = payment.notes.email;
            const plan = payment.notes.plan;
            console.log("Payment successful for email:", email);

            const plans = {
              free: { price: 0, tweets: 1 },
              bronze: { price: 100, tweets: 3 },
              silver: { price: 300, tweets: 5 },
              gold: { price: 1000, tweets: Infinity },
            };
            const subscriptionExpiresAt = new Date();
            subscriptionExpiresAt.setMonth(
              subscriptionExpiresAt.getMonth() + 1
            );
            // Update user's subscription details
            await usercollection.updateOne(
              { email: email },
              {
                $set: {
                  subscription: {
                    plan: plan,
                    tweetLimit: plans[plan].tweets,
                    tweetsPosted: 0,
                    subscriptionExpiresAt: subscriptionExpiresAt,
                  },
                },
              }
            );

            // Send subscription confirmation email
            sendSubscriptionEmail(email, plan, plans[plan]);
          }

          // Acknowledge receipt of the webhook
          res.json({ received: true });
        } catch (error) {
          console.error("Error processing webhook:", error);
          res.status(200).json({ received: true }); // Always acknowledge receipt
        }
      }
    );

    // Schedule a task to run every day at midnight
    cron.schedule("0 0 * * *", async () => {
      try {
        const now = new Date();

        // Find users whose subscriptions have expired
        const expiredUsers = await usercollection.find({
          "subscription.subscriptionExpiresAt": { $lte: now },
        });

        // Remove the subscription field for expired users
        for (const user of expiredUsers) {
          await usercollection.updateOne(
            { email: user.email },
            { $unset: { subscription: "" } }
          );
          console.log(`Removed subscription for user: ${user.email}`);
        }
      } catch (error) {
        console.error("Error cleaning up expired subscriptions:", error);
      }
    });
    app.get("/subscription", async (req, res) => {
      const { email } = req.query;

      // Validate the email
      if (!email || typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({ error: "Invalid email" });
      }

      try {
        const user = await usercollection.findOne(
          { email: email },
          { projection: { subscription: 1 } }
        );

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Default to "free" plan if no subscription exists
        const subscriptionPlan = user.subscription?.plan || "free";

        res.json({
          subscriptionPlan,
        });
      } catch (error) {
        console.error("Error fetching subscription plan:", error);
        res.status(500).json({ error: "Failed to fetch subscription plan" });
      }
    });
    async function sendSubscriptionEmail(email, plan, planDetails) {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: "Twiller-Support",
        to: email,
        subject: "Subscription Invoice",
        text: `
      Thank you for subscribing to the ${plan} plan!
      Your plan allows you to post ${
        planDetails.tweets === Infinity ? "unlimited" : planDetails.tweets
      } tweets per month.
      Amount Paid: ₹${planDetails.price}
    `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Subscription confirmation email sent to:", email);
      } catch (error) {
        console.error("Error sending subscription email:", error);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Twiller is working");
});

app.listen(port, () => {
  console.log(`Twiller clone is working on ${port}`);
});
server.listen(4000, () => {
  console.log(`WebSocket server is running on port 4000`);
});
