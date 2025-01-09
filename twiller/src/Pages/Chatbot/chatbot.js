import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [query, setQuery] = useState('');
  const [tweets, setTweets] = useState([]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/fetch-tweets', { query });
      setTweets(response.data.tweets);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleQuerySubmit}>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Ask me about anything..."
        />
        <button type="submit">Search</button>
      </form>
      <div>
        {tweets.map((tweet, index) => (
          <div key={index}>
            <p>{tweet.user.name}: {tweet.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chatbot;
