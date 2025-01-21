import React, { useState } from "react";
import "./chatbot.css";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress"; // Loading spinner
import axios from "axios";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(""); // Store chatbot response
  const [tweets, setTweets] = useState([]); // Store fetched tweets
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false); // Track rate limit status

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true); // Start loading
    setError(null); // Clear previous error
    setResponse(""); // Clear previous chatbot response
    setTweets([]); // Clear previous tweets
    setRateLimitExceeded(false); // Reset rate limit status

    try {
      // Send query to the backend (which uses Twitter API v2 and OpenAI API)
      const res = await axios.post("https://twiller-twitterclone-ewhk.onrender.com/gemini", {
        query,
      });

      // Set the chatbot response and tweets
      setResponse(res.data.response);
      setTweets(res.data.tweets);

      // If no tweets are found, set an error message
      if (res.data.tweets.length === 0) {
        setError("No tweets found for this query.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response && error.response.status === 429) {
        // Handle rate limit error
        setRateLimitExceeded(true);
        setError("Rate limit exceeded. Please try again after 15 minutes.");
      } else {
        setError("Failed to fetch data. Please try again.");
      }
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
          <div className="loading_spinner">
            <CircularProgress /> {/* Loading spinner */}
          </div>
        ) : error ? (
          <div className="error_message">
            {error}
            {rateLimitExceeded && (
              <p>You can retry after 15 minutes.</p>
            )}
          </div>
        ) : (
          <>
            {/* Display chatbot response */}
            {response && (
              <div className="chatbot_response">
                <strong>Chatbot:</strong> {response}
              </div>
            )}

            {/* Display fetched tweets */}
            {tweets.length > 0 && (
              <div className="tweets_container">
                {tweets.map((tweet) => (
                  <div key={tweet.id} className="tweet-card">
                    <div className="tweet-header">
                      <img
                        src={tweet.author.profile_image_url}
                        alt={tweet.author.name}
                        className="profile-image"
                      />
                      <div className="author-details">
                        <strong>{tweet.author.name}</strong>
                        <span>@{tweet.author.username}</span>
                      </div>
                    </div>
                    <div className="tweet-text">{tweet.text}</div>
                    <div className="tweet-metrics">
                      <span>Retweets: {tweet.metrics.retweets}</span>
                      <span>Likes: {tweet.metrics.likes}</span>
                      <span>Replies: {tweet.metrics.replies}</span>
                    </div>
                    <div className="tweet-date">
                      <small>{new Date(tweet.date).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
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
            disabled={isLoading || rateLimitExceeded} // Disable input while loading or rate limit exceeded
          />
          <button
            type="submit"
            className="send_icon"
            onClick={handleFormSubmit}
            disabled={isLoading || rateLimitExceeded} // Disable button while loading or rate limit exceeded
          >
            {isLoading ? (
              <CircularProgress size={20} /> // Show spinner inside button
            ) : (
              <SendIcon className="send_icon" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;