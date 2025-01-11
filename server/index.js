const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const url =
  "mongodb+srv://admin:admin@twitter.3aijc.mongodb.net/?retryWrites=true&w=majority&appName=twitter";
const port = 5000;
const axios = require("axios");
const Bottleneck = require("bottleneck");
const NodeCache = require("node-cache");

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(url);

const limiter = new Bottleneck({ minTime: 1000, maxConcurrent: 1 });
const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

function getToken(id) {
  return ((Number(id) / 1e15) * Math.PI)
    .toString(6 ** 2)
    .replace(/(0+|\.)/g, "");
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

    // Endpoint to fetch tweets for the chatbot
    app.get("/tweets", async (req, res) => {
      const query = req.query.q;
      const cachedTweets = cache.get(query);
      if (cachedTweets) {
        return res.json(cachedTweets);
      }
      const url = `https://cdn.syndication.twimg.com/tweet-result?id=${encodeURIComponent(
        query
      )}`;
      try {
        const response = await limiter.schedule(() => axios.get(url));
        const tweetData = response.data || [];

        if (!Array.isArray(tweetData)) { 
          throw new Error("Invalid tweet data format");
         }
         tweetData = tweetData.statuses;
        const tweetsWithTokens = tweetData.map((tweet) => {
          const token = getToken(tweet.id);
          return { ...tweet, token };
        });
        console.log("Fetched tweets:", tweetsWithTokens);
        cache.set(query, tweetsWithTokens);
        res.json(tweetsWithTokens);
      } catch (error) {
        if (error.response && error.response.status === 429) {
          const retryAfter = parseInt(
            error.response.headers["retry-after"] || "60",
            10
          );
          console.error(
            `Rate limit exceeded. Retrying after ${retryAfter} seconds`
          );
          setTimeout(async () => {
            try {
              const response = await limiter.schedule(() => axios.get(url));
              const tweetData = response.data || [];
              const tweetsWithTokens = tweetData.map((tweet) => {
                const token = getToken(tweet.id);
                return { ...tweet, token };
              });
              console.log("Fetched tweets after retry:", tweetsWithTokens);
              cache.set(query, tweetsWithTokens);
              res.json(tweetsWithTokens);
            } catch (retryError) {
              console.error("Error fetching tweets after retry:", retryError);
              res
                .status(500)
                .send({
                  message: "Error fetching tweets after retry",
                  error: retryError.response
                    ? retryError.response.data
                    : retryError.message,
                });
            }
          }, retryAfter * 1000);
        } else {
          console.error("Error fetching tweets:", error);
          res.status(500).send("Error fetching tweets");
        }
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
