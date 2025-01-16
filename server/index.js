const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

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

// Function to scrape tweets using Puppeteer
async function scrapeTweets(query) {
  try {
    console.log(`Scraping tweets for query: ${query}`);
    const response = await axios.get(
      `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query`
    );
    const $ = cheerio.load(response.data);
    const tweets = [];
    $("article[data-testid='tweet']").each((index, element) => {
      const text = $(element).find("div[lang]").text() || "No text";
      const user =
        $(element).find("div[data-testid='User-Name']").text() ||
        "Unknown user";
      const url = $(element).find("a[href*='/status/']").attr("href") || "#";
      tweets.push({ text, user, url: `https://x.com${url}` });
    });
    console.log(`Scraped ${tweets.length} tweets`);
    return tweets;
  } catch (error) {
    console.error("Error during scraping:", error);
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
