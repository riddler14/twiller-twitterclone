import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FollowSection.css";

const FollowSection = ({ user,onFollowUpdate }) => {
  const [followingCount, setFollowingCount] = useState(0); // Store count of following
  const [followersCount, setFollowersCount] = useState(0); // Store count of followers
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch following and followers counts
    const fetchCounts = async () => {
      try {
        const followingResponse = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/following?email=${user?.email}`
        );
        const followersResponse = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/followers?email=${user?.email}`
        );

        setFollowingCount(followingResponse.data.following?.length || 0);
        setFollowersCount(followersResponse.data.followers?.length || 0);
      } catch (error) {
        console.error("Error fetching follow counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [user?.email, onFollowUpdate]); 

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