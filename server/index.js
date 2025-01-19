const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
// const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2"); // Official Twitter API v2
const  OpenAI = require("openai");
const rateLimit = require("express-rate-limit"); // OpenAI API

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


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
async function generateChatbotResponse(query) {
  try {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `You are a helpful chatbot. Answer the following question: ${query}`,
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0].text.trim();
  } catch (error) {
    if (error.code === "insufficient_quota") {
      return "Sorry, the chatbot is currently unavailable due to quota limits. Please try again later.";
    }
    console.error("Error generating chatbot response:", error);
    throw error;
  }
}

async function run() {
  try {
    await client.connect();
    console.log(`server running on port ${port}`);
    const postcollection = client.db("database").collection("posts");
    const usercollection = client.db("database").collection("users");

    app.post("/register", async (req, res) => {
      const user = req.body;
      const result = await usercollection.insertOne(user);
      res.send(result);
    });

    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const user = await usercollection.find({ email: email }).toArray();
      res.send(user);
    });

    app.post("/post", async (req, res) => {
      const post = req.body;
      const result = await postcollection.insertOne(post);
      res.send(result);
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
    app.post("/chatbot", userLimiter, async (req, res) => {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      try {
        const chatbotResponse = await generateChatbotResponse(query);
        const tweets = await fetchTweets(query);
        res.json({ response: chatbotResponse, tweets });
      } catch (error) {
        console.error("Error in chatbot endpoint:", error);
        res.status(500).json({ error: "Failed to process request" });
      }
    });

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
