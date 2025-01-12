import React, { useState, useEffect } from "react";
import "./chatbot.css";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";

import axios from "axios";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [tweets, setTweets] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!query) return;
  
    try {
      const res = await axios.get(`https://twiller-twitterclone-ewhk.onrender.com/tweets?q=${query}`);
      const tweets = res.data.tweets;
      setTweets(tweets);
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setError("Failed to fetch tweets. Please try again.");
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
      {isLoading ? (
          <p>Loading tweets...</p>
        ) : tweets.length > 0 ? (
          tweets.map((tweet, index) => (
            <div key={index} className="tweet">
              <p>
                <strong>{tweet.user}</strong>: {tweet.text}
              </p>
              <a href={tweet.url} target="_blank" rel="noopener noreferrer">
                View Tweet
              </a>
            </div>
          ))
        ) : (
          <div className="error_message">
          {error || "No tweets found for this query."}
        </div>
        )}
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
            disabled={isLoading} // Disable button while loading
          >
            <SendIcon className="send_icon" />
          </button>
        </div>
      </div>

    
    </div>
  );
};

export default Chatbot;
