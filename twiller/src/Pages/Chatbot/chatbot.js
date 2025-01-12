import React, { useState, useEffect } from "react";
import "./chatbot.css";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tweetIds, setTweetIds] = useState([]); // Store tweet IDs for embedding

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true); // Start loading
    setError(null); // Clear previous error
    setTweetIds([]); // Clear previous tweet IDs

    try {
      // Fetch tweet IDs from the backend
      const res = await axios.get(`https://twiller-twitterclone-ewhk.onrender.com/tweets?q=${query}`);
      const { tweetIds } = res.data;

      // Set the fetched tweet IDs
      setTweetIds(tweetIds);

      // If no tweets are found, set an error message
      if (tweetIds.length === 0) {
        setError("No tweets found for this query.");
      }
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setError("Failed to fetch tweets. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Load Twitter widgets.js script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Render embedded tweets
  useEffect(() => {
    if (tweetIds.length > 0) {
      // Re-render Twitter widgets to display embedded tweets
      window.twttr?.widgets.load();
    }
  }, [tweetIds]);

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
        ) : tweetIds.length > 0 ? (
          // Render embedded tweets
          tweetIds.map((tweetId) => (
            <div key={tweetId} className="tweet-embed">
              <blockquote className="twitter-tweet">
                <a href={`https://twitter.com/user/status/${tweetId}`}></a>
              </blockquote>
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

export default Chatbot