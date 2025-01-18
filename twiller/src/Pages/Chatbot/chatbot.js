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
  const [response, setResponse] = useState(""); // Store chatbot response
  const [tweets, setTweets] = useState([]); // Store fetched tweets

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

    try {
      // Send query to the backend (which uses Twitter API v2 and OpenAI API)
      const res = await axios.post("https://twiller-twitterclone-ewhk.onrender.com/chatbot", {
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
      setError("Failed to fetch data. Please try again.");
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
          <p>Loading...</p>
        ) : error ? (
          <div className="error_message">{error}</div>
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
                    <div className="tweet-user">
                      <strong>User ID: {tweet.author_id}</strong>
                    </div>
                    <div className="tweet-text">{tweet.text}</div>
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