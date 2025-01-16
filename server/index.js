const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Rettiwt } = require("rettiwt-api"); // Import Rettiwt-API
const puppeteer=require("puppeteer");

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
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function getTwitterCookies() {
  const browser = await puppeteer.launch({ headless: false }); // Run in non-headless mode for debugging
  const page = await browser.newPage();

  // Go to Twitter login page
  await page.goto("https://twitter.com/login");

  // Wait for manual login
  console.log("Please log in to Twitter in the browser...");
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // Extract cookies
  const cookies = await page.cookies("https://twitter.com");
  const authToken = cookies.find((cookie) => cookie.name === "auth_token").value;
  const ct0Token = cookies.find((cookie) => cookie.name === "ct0").value;

  console.log("auth_token:", authToken);
  console.log("ct0:", ct0Token);

  await browser.close();

  return { authToken, ct0Token };
}

// Initialize Rettiwt-API with cookies
let rettiwt;

async function initializeRettiwt() {
  const { authToken, ct0Token } = await getTwitterCookies();
  rettiwt = new Rettiwt({
    auth_token: authToken,
    ct0: ct0Token,
  });
}
// Function to scrape tweets using Puppeteer
async function fetchTweets(query) {
  try {
    console.log(`Fetching tweets for query: ${query}`);
    const tweets = await rettiwt.tweet.search({
      words: query, // Search for tweets containing the query
      count: 10,    // Number of tweets to fetch
    });

    // Format the tweets
    const formattedTweets = tweets.list.map(tweet => ({
      id: tweet.id,
      text: tweet.fullText,
      user: tweet.createdBy.fullName,
      username: tweet.createdBy.userName,
      date: tweet.createdAt,
    }));

    console.log(`Fetched ${formattedTweets.length} tweets`);
    return formattedTweets;
  } catch (error) {
    console.error("Error fetching tweets:", error);
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
  } catch (error) {
    console.log(error);
  }
}
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
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Twiller is working");
});

app.listen(port, () => {
  console.log(`Twiller clone is working on ${port}`);
});
