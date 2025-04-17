import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";
import { Avatar } from "@mui/material";
import "./Posts.css";
const UserPost = () => {
  const { id } = useParams(); // Extract postId from the URL
  const [post, setPost] = useState(null); // Store the fetched post data
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null); // Store the user's _id locally
  const [loggedinuser] = useLoggedinuser(); // Assuming this hook provides the logged-in user's data
  const loggedInEmail = loggedinuser[0]?.email;
  const fetchUserId = async (email) => {
      try {
        const response = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/userprofile?email=${encodeURIComponent(email)}`
        );
  
        if (response.data.user) {
          setUserId(response.data.user._id); // Store the _id locally
        }   if (email === loggedInEmail) {
          alert("This is your profile!");
          return;
        }else {
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
      }else {
        navigate(`/home/profile/${userId}`); // Navigate to the user's profile page
      }
    };
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/post/${id}`
        );
        if (response.data.post) {
          setPost(response.data.post);
        } else {
          alert("Post not found.");
          navigate("/"); // Redirect to home if post is not found
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        alert("Failed to fetch post. Please try again.");
        navigate("/");
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (!post) {
    return <div>Loading...</div>;
  }

  const { name, username, photo, profilephoto, audio, email } = post;

  return (
    <div className="post" >
      <div className="post__avatar">
        <Avatar src={profilephoto} />
      </div>
      <div className="post__body">
        <div className="post__header">
          <div className="post__headerText">
            <h3 onClick={handleUserClick} className="user_name">
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

export default UserPost;