import React, { useState } from "react";
import "./chatbot.css";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import { Tweet } from "react-tweet";
import axios from "axios";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [tweets, setTweets] = useState([]);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `https://twiller-twitterclone-ewhk.onrender.com/tweets?q=${query}`
      );
      const tweetData = response.data.data || [];
      if (Array.isArray(tweetData)) {
        setTweets(tweetData);
      } else {
        setTweets([]);
      }
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setError("Failed to fetch tweets. Please try again later.");
    }
  };
  return (
    <div className="chatbot">
      <div className="chatbot__header">
        <h2>
          Chatbot{" "}
          <span className="post__headerSpecial">
            <VerifiedUserIcon className="post__badge" />
          </span>
        </h2>
      </div>

      <div className="result_container">
        <div className="tweet_container">
          {tweets.map((tweet, index) => (
            <Tweet key={index} id={tweet.id} />
          ))}
        </div>
      </div>

      <div className="searchbox">
        <div className="searchbox__input">
          <ChatIcon className="searchbox__Icon" />
          <input
            placeholder="Ask Me Anything"
            type="text"
            value={query}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="send_icon"
            onClick={handleFormSubmit}
          >
            <SendIcon className="send_icon" />
          </button>
        </div>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default Chatbot;
