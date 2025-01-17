const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
// const axios = require("axios");
const { Rettiwt } = require("rettiwt-api"); // Import Rettiwt-API
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

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
async function getTwitterCookies() {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(), // Use the custom Chrome binary
     headless: chromium.headless, 
        args: chromium.args,
        }); // Run in non-headless mode for debugging
  const page = await browser.newPage();

  // Go to Twitter login page
  try {
    // Go to Twitter login page
    await page.goto("https://twitter.com/login", { waitUntil: "networkidle2" });

    // Wait for the username input field
    await page.waitForSelector('input[name="text"]', { visible: true });

    // Enter username
    await page.type('input[name="text"]', process.env.TWITTER_USERNAME);

    // Click the "Next" button
    const [nextButton] = await page.$x("//span[contains(text(), 'Next')]");
    if (nextButton) {
      await nextButton.click();
    } else {
      throw new Error("Next button not found.");
    }

    // Wait for the password input field
    await page.waitForSelector('input[name="password"]', { visible: true });

    // Enter password
    await page.type('input[name="password"]', process.env.TWITTER_PASSWORD);

    // Click the "Log in" button
    const [loginButton] = await page.$x("//span[contains(text(), 'Log in')]");
    if (loginButton) {
      await loginButton.click();
    } else {
      throw new Error("Log in button not found.");
    }

    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Fetch cookies using CDP (Chrome DevTools Protocol)
    const client = await page.target().createCDPSession();
    const { cookies } = await client.send("Network.getAllCookies");

    // Find the auth_token and ct0 cookies
    const authToken = cookies.find((cookie) => cookie.name === "auth_token")?.value;
    const ct0Token = cookies.find((cookie) => cookie.name === "ct0")?.value;

    if (!authToken || !ct0Token) {
      throw new Error("Failed to extract auth_token or ct0 cookies.");
    }

    console.log("auth_token:", authToken);
    console.log("ct0:", ct0Token);

    await browser.close();

    return { authToken, ct0Token };
  } catch (error) {
    console.error("Error during login or cookie extraction:", error);
    await browser.close();
    throw error;
  }
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
    await initializeRettiwt(); // Ensure Rettiwt-API is initialized
    console.log(`Fetching tweets for query: ${query}`);
    const tweets = await rettiwt.tweet.search({
      words: query, // Search for tweets containing the query
      count: 10, // Number of tweets to fetch
    });

    // Format the tweets
    const formattedTweets = tweets.list.map((tweet) => ({
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
