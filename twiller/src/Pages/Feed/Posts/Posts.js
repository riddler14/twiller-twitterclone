import {React,useState} from "react";
import "./Posts.css";
import { Avatar } from "@mui/material";
import axios from "axios";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";
import { useNavigate } from "react-router-dom";

const Posts = ({ p }) => {
  const { name, username, photo, post, profilephoto,audio,email } = p;
  const navigate=useNavigate();
  const [userId, setUserId] = useState(null); // Store the user's _id locally

  // Fetch user's _id based on email
  const fetchUserId = async (email) => {
    try {
      const response = await axios.get(
        `https://twiller-twitterclone-2-q41v.onrender.com/userprofile?email=${encodeURIComponent(email)}`
      );

      if (response.data.user) {
        setUserId(response.data.user._id); // Store the _id locally
      } else {
        console.error("User not found for email:", email);
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  // Handle user click to navigate to the user's profile
  const handleUserClick = () => {
    if (!email) {
      console.error("Email is missing.");
      alert("This post does not have a valid email.");
      return;
    }

    if (!userId) {
      fetchUserId(email); // Fetch the user's _id if not already fetched
    } else {
      navigate(`/home/profile/${userId}`); // Navigate to the user's profile page
    }
  };

  return (
    <div className="post">
      <div className="post__avatar">
        <Avatar src={profilephoto} />
      </div>
      <div className="post__body">
        <div className="post__header">
          <div className="post__headerText">
            <h3 onClick={handleUserClick}>
              {name}{" "}
              <span className="post__headerSpecial">
                <VerifiedUserIcon className="post__badge" /> @{username}
              </span>
            </h3>
          </div>
          <div className="post__headerDescription">
            <p>{post}</p>
          </div>
        </div>
        <img src={photo} alt="" width="500" />
        {audio && (
          <div className="post__audio">
            <audio controls style={{ width: "100%" }}>
              <source src={audio} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        <div className="post__footer">
          <ChatBubbleOutlineIcon
            className="post__footer__icon"
            fontSize="small"
          />
          <RepeatIcon className="post__footer__icon" fontSize="small" />
          <FavoriteBorderIcon className="post__footer__icon" fontSize="small" />
          <PublishIcon className="post__footer__icon" fontSize="small" />
        </div>
      </div>
    </div>
  );
};

export default Posts;