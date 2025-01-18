const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
// const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2"); // Official Twitter API v2
const { Configuration, OpenAIApi } = require("openai"); // OpenAI API

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
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
// Function to scrape tweets using Puppeteer
async function fetchTweets(query) {
  try {
    const tweets = await twitterClient.v2.search(query, {
      max_results: 10, // Fetch up to 10 tweets
      "tweet.fields": "created_at,author_id", // Include additional fields
    });

    // Format the tweets
    const formattedTweets = tweets.data.data.map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      author_id: tweet.author_id,
      date: tweet.created_at,
    }));

    return formattedTweets;
  } catch (error) {
    console.error("Error fetching tweets:", error);
    throw error;
  }
}

// Function to generate a chatbot response using OpenAI API
async function generateChatbotResponse(query) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003", // Use GPT-3.5 model
      prompt: `You are a helpful chatbot. Answer the following question: ${query}`,
      max_tokens: 100, // Limit the response length
      temperature: 0.7, // Control creativity
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
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
    app.get("/tweets", async (req, res) => {
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

    app.post("/chatbot", async (req, res) => {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      try {
        // Generate a chatbot response using OpenAI
        const chatbotResponse = await generateChatbotResponse(query);

        // Fetch relevant tweets using Twitter API
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
