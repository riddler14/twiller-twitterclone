import React, { useState, useEffect } from "react";
import "./chatbot.css";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false); // State to control timeline visibility

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true); // Start loading
    setError(null); // Clear previous error
    setShowTimeline(false); // Hide timeline initially

    // Simulate a delay to show loading state
    setTimeout(() => {
      if (query.trim() === "") {
        setError("Please enter a valid query.");
      } else {
        setShowTimeline(true); // Show timeline if query is valid
      }
      setIsLoading(false); // Stop loading
    }, 1000); // Simulate a 1-second delay
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
        ) : showTimeline ? (
          // Render Twitter Timeline Embed
          <div className="twitter-timeline-container">
            <a
              className="twitter-timeline"
              href={`https://twitter.com/search?q=${encodeURIComponent(query)}`}
              data-width="600"
              data-height="800"
              data-theme="light"
            >
              Tweets about {query}
            </a>
          </div>
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