import React, { useState } from "react";
import "./chatbot.css";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tweets, setTweets] = useState([]); // Store scraped tweets

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true); // Start loading
    setError(null); // Clear previous error
    setTweets([]); // Clear previous tweets

    try {
      // Fetch tweets from the backend (which uses Cheerio)
      const res = await axios.get(`https://twiller-twitterclone-ewhk.onrender.com/tweets?q=${query}`);
      const { tweets } = res.data;

      // Set the fetched tweets
      setTweets(tweets);

      // If no tweets are found, set an error message
      if (tweets.length === 0) {
        setError("No tweets found for this query.");
      }
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setError("Failed to fetch tweets. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
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
          // Render scraped tweets
          tweets.map((tweet, index) => (
            <div key={index} className="tweet-card">
              <div className="tweet-user">
                <strong>{tweet.user}</strong>
              </div>
              <div className="tweet-text">{tweet.text}</div>
              <div className="tweet-url">
                <a href={tweet.url} target="_blank" rel="noopener noreferrer">
                  View on X
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="error_message">
            {error || "Enter a query to see tweets."}
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
