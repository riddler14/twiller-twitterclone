import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FollowSection.css";

const FollowSection = ({ user }) => {
  const [followingCount, setFollowingCount] = useState(0); // Store count of following
  const [followersCount, setFollowersCount] = useState(0); // Store count of followers
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch following list
    const fetchFollowing = async () => {
      try {
        const response = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/following?email=${user?.email}`
        );
        setFollowingCount(response.data.following?.length || 0);
      } catch (error) {
        console.error("Error fetching following list:", error);
      }
    };

    // Fetch followers list
    const fetchFollowers = async () => {
      try {
        const response = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/followers?email=${user?.email}`
        );
        setFollowersCount(response.data.followers?.length || 0);
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
      <div className="follow-info">
        <h3>Following</h3>
        <p>{followingCount}</p>
      </div>

      <div className="follow-info">
        <h3>Followers</h3>
        <p>{followersCount}</p>
      </div>
    </div>
  );
};

export default FollowSection;