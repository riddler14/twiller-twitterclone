// FollowButton.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const FollowButton = ({ loggedInUserEmail, profileUserEmail }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  // Check if the logged-in user is already following the profile user
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const response = await axios.get(
          `https://twiller-twitterclone-1-j9kj.onrender.com/following?email=${loggedInUserEmail}`
        );
        const followingList = response.data.following || [];
        setIsFollowing(followingList.includes(profileUserEmail));
      } catch (error) {
        console.error("Error fetching follow status:", error);
      }
    };

    if (loggedInUserEmail && profileUserEmail) {
      checkFollowStatus();
    }
  }, [loggedInUserEmail, profileUserEmail]);

  // Handle Follow/Unfollow
  const handleFollowToggle = async () => {
    try {
      const response = await axios.post(
        "https://twiller-twitterclone-1-j9kj.onrender.com/follow",
        {
          followerEmail: loggedInUserEmail,
          followeeEmail: profileUserEmail,
        }
      );

      if (response.data.message === "Followed successfully") {
        setIsFollowing(true);
      } else if (response.data.message === "Unfollowed successfully") {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <button onClick={handleFollowToggle} className="follow-button">
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;