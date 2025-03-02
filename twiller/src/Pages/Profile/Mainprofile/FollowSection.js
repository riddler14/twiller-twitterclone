import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FollowSection.css";

const FollowSection = ({ user }) => {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch following list
    const fetchFollowing = async () => {
      try {
        const response = await axios.get(
          `https://twiller-twitterclone-1-j9kj.onrender.com/following?email=${user?.email}`
        );
        setFollowing(response.data.following || []);
      } catch (error) {
        console.error("Error fetching following list:", error);
      }
    };

    // Fetch followers list
    const fetchFollowers = async () => {
      try {
        const response = await axios.get(
          `https://twiller-twitterclone-1-j9kj.onrender.com/followers?email=${user?.email}`
        );
        setFollowers(response.data.followers || []);
      } catch (error) {
        console.error("Error fetching followers list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
    fetchFollowers();
  }, [user?.email]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="follow-section">
      <h3>Following</h3>
      <ul>
        {following.length > 0 ? (
          following.map((followee, index) => (
            <li key={index}>{followee}</li>
          ))
        ) : (
          <li>No users being followed.</li>
        )}
      </ul>

      <h3>Followers</h3>
      <ul>
        {followers.length > 0 ? (
          followers.map((follower, index) => (
            <li key={index}>{follower}</li>
          ))
        ) : (
          <li>No followers yet.</li>
        )}
      </ul>
    </div>
  );
};

export default FollowSection;