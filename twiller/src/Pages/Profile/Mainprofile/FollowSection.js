import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FollowSection.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
const FollowSection = ({ user,onFollowUpdate }) => {
  const [followingCount, setFollowingCount] = useState(0); // Store count of following
  const [followersCount, setFollowersCount] = useState(0); // Store count of followers
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate();
  const {t}=useTranslation();
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
const handlefollowersclick=async()=>{
  try{
    navigate(`/home/profile/followers`);}
  catch{
    alert("page not found");
  }
}
const handlefollowingclick=async()=>{
  try{
    navigate(`/home/profile/following`);}
  catch{
    alert("page not found");
  }
}

  return (
    <div className="follow-section">
      <div className="follow-info">
        <h3 onClick={handlefollowingclick} style={ {cursor:"pointer"}}>{t('Following')}</h3>
        <p>{followingCount}</p>
      </div>

      <div className="follow-info">
        <h3 onClick={handlefollowersclick} style={ {cursor:"pointer"}}>{t('Followers')}</h3>
        <p>{followersCount}</p>
      </div>
    </div>
  );
};

export default FollowSection;