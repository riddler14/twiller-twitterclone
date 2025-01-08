const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const url =
  "mongodb+srv://admin:admin@twitter.3aijc.mongodb.net/?retryWrites=true&w=majority&appName=twitter";
const port = 5000;
const axios = require("axios");
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const session = require("express-session");
const Bottleneck = require("bottleneck");

const NodeCache = require("node-cache");
const BEARER_TOKEN =
  "AAAAAAAAAAAAAAAAAAAAAAbGxwEAAAAAg4LFbxNVXMhHWl5nMREorp%2FU3gw%3Dbs727pAIVl9NbydzOPEQzewVcSCf2OlyruIw4XsSXwP2tf5Ys6";
const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(url);

const limiter = new Bottleneck({
  minTime: 1000,
  // Minimum time between requests (in milliseconds)
  maxConcurrent: 1,
});

const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });
// Configure session middleware
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new TwitterStrategy(
    {
      consumerKey: "pvKwnLQu1WbsXEn3oukKdKgBW",
      consumerSecret: "FrTp07icR5o3fn15JvFMqUxAO4pzdJLTNqi9DOCswcR5upCNOE",
      callbackURL:
        "https://twiller-twitterclone-ewhk.onrender.com/auth/twitter/callback",
    },
    function (token, tokenSecret, profile, done) {
      // Save user profile or token information here if needed
      return done(null, profile);
    }
  )
);
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

async function run() {
  try {
    await client.connect();
    console.log(`server running on port ${port}`);
    const postcollection = client.db("database").collection("posts");
    const usercollection = client.db("database").collection("users");
    app.post("/register", async (req, res) => {
      const user = req.body;
      // console.log(user)
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
      // console.log(profile)
      const result = await usercollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.get("/tweets", async (req, res) => {
      const query = req.query.q;
      const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}`;
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
        });
        res.json(response.data);
      } catch (error) {
        if (error.response && error.response.status === 429) {
          // Handle rate limit error with exponential backoff
          const retryAfter = parseInt(
            error.response.headers["retry-after"] || "60",
            10
          ); // Fallback to 60 seconds if not provided
          console.error(
            `Rate limit exceeded. Retrying after ${retryAfter} seconds`
          );
          setTimeout(async () => {
            try {
              const response = await limiter.schedule(() =>
                axios.get(url, {
                  headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
                })
              );
              cache.set(query, response.data);
              res.json(response.data);
            } catch (retryError) {
              console.error("Error fetching tweets after retry:", retryError);
              res.status(500).send({
                message: "Error fetching tweets after retry",
                error: retryError.response
                  ? retryError.response.data
                  : retryError.message,
              });
            }
          }, retryAfter * 1000);
        } else {
          console.error("Error fetching tweets:", error); // Log the full error object
          res.status(500).send({
            message: "Error fetching tweets",
            error: error.response ? error.response.data : error.message,
          });
        }
      }
    });

    // Twitter Authentication Route
    app.get("/auth/twitter", passport.authenticate("twitter"));
    // Twitter Callback Route
    app.get(
      "/auth/twitter/callback",
      passport.authenticate("twitter", { failureRedirect: "/" }),
      function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/");
      }
    );
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
