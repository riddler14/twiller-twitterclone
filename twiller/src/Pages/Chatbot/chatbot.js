import React, { useState } from "react";
import "./chatbot.css";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [tweets, setTweets] = useState([]);
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `https://twiller-twitterclone-ewhk.onrender.com/tweets?q=${query}`
      );
      setTweets(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tweets:", error);
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
      <form onSubmit={handleFormSubmit}>
        {" "}
        <div className="searchbox">
          {" "}
          <ChatIcon className="searchbox__Icon" />{" "}
          <input
            placeholder="Ask Me Anything"
            type="text"
            value={query}
            onChange={handleInputChange}
          />{" "}
          <button type="submit" className="send_icon">
            {" "}
            <SendIcon />{" "}
          </button>{" "}
        </div>{" "}
      </form>{" "}
      <div className="tweets">
        {Array.isArray(tweets) &&
          tweets.map((tweet) => (
            <div key={tweet.id} className="tweet">
              {" "}
              {tweet.text}{" "}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Chatbot;
