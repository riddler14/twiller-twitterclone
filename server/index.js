const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer"); // Use puppeteer-extra for additional plugins
// const StealthPlugin = require("puppeteer-extra-plugin-stealth"); // Avoid detection
// const Parser = require("rss-parser");

const url =
  "mongodb+srv://admin:admin@twitter.3aijc.mongodb.net/?retryWrites=true&w=majority&appName=twitter";
const port = 5000;
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// const axios = require("axios");
require("dotenv").config();
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const app = express();
app.use(cors());
app.use(express.json());
// const parser = new Parser();

const client = new MongoClient(url);

// const TAGGBOX_API_URL = "https://api.taggbox.com/v1/widget";
// const TAGGBOX_API_KEY = process.env.TAGGBOX_API_KEY; // Store your Taggbox API key in .env
// const TAGGBOX_WIDGET_ID = process.env.TAGGBOX_WIDGET_ID; // Store your Taggbox widget ID in .env
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


function installChrome() {
  const chromePath = path.join(__dirname, "local-chrome");

  if (!fs.existsSync(chromePath)) {
    fs.mkdirSync(chromePath, { recursive: true });
  }

  console.log("Downloading Chrome for Render environment...");
  try {
    // Download Chrome
    execSync(
      `wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -O ${chromePath}/chrome.deb`
    );

    // Extract Chrome
    execSync(`dpkg -x ${chromePath}/chrome.deb ${chromePath}`);

    // Move the Chrome binary to the correct location
    fs.renameSync(
      path.join(chromePath, "opt", "google", "chrome", "chrome"),
      path.join(chromePath, "chrome")
    );

    // Clean up
    fs.unlinkSync(path.join(chromePath, "chrome.deb"));
    console.log("Chrome downloaded and installed successfully.");
  } catch (error) {
    console.error("Error downloading or installing Chrome:", error);
    process.exit(1); // Exit with an error code
  }
}
if (process.env.NODE_ENV === "production") {
  installChrome();
}


// Function to scrape tweets using Puppeteer
async function scrapeTweets(query) {
  let executablePath;

  if (process.env.NODE_ENV === "production") {
    // Use the downloaded Chrome binary in production
    executablePath = path.join(__dirname, "local-chrome", "chrome");
  } else {
    // Use the default Chrome binary during development
    executablePath = puppeteer.executablePath();
  } 
  const browser = await puppeteer.launch({
    headless: true, // Run in headless mode for production
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for some environments
  });
  const page = await browser.newPage();

  // Set a random user agent to avoid detection
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  ];
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(randomUserAgent);

  // Navigate to Twitter search results
  await page.goto(`https://twitter.com/search?q=${encodeURIComponent(query)}&src=typed_query`, {
    waitUntil: "networkidle2",
  });

  // Add a random delay to mimic human behavior
  await delay(Math.floor(Math.random() * 4000) + 1000);

  // Scrape tweets
  const tweets = await page.evaluate(() => {
    const tweetElements = document.querySelectorAll("article[data-testid='tweet']");
    return Array.from(tweetElements).map((tweet) => {
      const text = tweet.querySelector("div[lang]")?.innerText || "No text";
      const user = tweet.querySelector("div[data-testid='User-Name']")?.innerText || "Unknown user";
      const url = tweet.querySelector("a[href*='/status/']")?.href || "#";
      return { text, user, url };
    });
  });

  await browser.close();
  return tweets;
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
  const query = req.query.q; // User-entered query (e.g., "cricket")

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const tweets = await scrapeTweets(query);
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
