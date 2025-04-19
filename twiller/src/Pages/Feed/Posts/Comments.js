import React, { useState,useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";
import { Avatar } from "@mui/material";
import "./Comments.css";


const Comments = ({ p }) => {
  // Extract postId from the URL
   // Store the fetched post data
   const { name, username, photo,post, profilephoto, audio,video, email } = p;
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null); // Store the user's _id locally
  const [loggedinuser] = useLoggedinuser(); // Assuming this hook provides the logged-in user's data
  const loggedInEmail = loggedinuser[0]?.email;
   const videoRef = useRef(null); // Reference to the video element
    const [tapCount, setTapCount] = useState(0); 
   
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
  // useEffect(() => {
  //   const fetchPost = async () => {
  //     try {
  //       const response = await axios.get(
  //         `https://twiller-twitterclone-2-q41v.onrender.com/post/${id}`
  //       );
  //       if (response.data.post) {
  //         setPost(response.data.post);
  //       } else {
  //         alert("Post not found.");
  //         navigate("/"); // Redirect to home if post is not found
  //       }
  //     } catch (error) {
  //       console.error("Error fetching post:", error);
  //       alert("Failed to fetch post. Please try again.");
  //       navigate("/");
  //     }
  //   };

  //   fetchPost();
  // }, [id, navigate]);
  const resetTapCount = () => {
    setTimeout(() => setTapCount(0), 300); // 300ms timeout for multi-tap detection
  };

  // Handle double-tap gestures
  const handleDoubleTap = (direction) => {
    const video = videoRef.current;
    if (!video) return;

    if (direction === "right") {
      video.currentTime += 10; // Move 10 seconds forward
    } else if (direction === "left") {
      video.currentTime -= 10; // Move 10 seconds backward
    }
  };

  // Handle single-tap gestures
  const handleSingleTap = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play(); // Resume playback
    } else {
      video.pause(); // Pause playback
    }
  };

  // Handle three-tap gestures
  const handleTripleTap = (position) => {
    switch (position) {
      case "middle":
        alert("Moving to the next video..."); // Replace with logic to move to the next video
        break;
      case "right":
        alert("Closing the website...");
        window.close(); // Close the browser tab
        break;
      case "left":
        alert("Showing comments...");
        // Replace with logic to show the comment section
        break;
      default:
        break;
    }
  };

  // Detect taps and their positions
  const handleTap = (e) => {
    const { clientX, clientY } = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Determine tap position (left, middle, right)
    const isLeft = clientX < width / 3;
    const isRight = clientX > (width * 2) / 3;
    const isMiddle = !isLeft && !isRight;

    // Increment tap count
    setTapCount((prev) => prev + 1);

    // Handle gestures based on tap count
    if (tapCount === 1) {
      handleSingleTap();
    } else if (tapCount === 2) {
      if (isRight) handleDoubleTap("right");
      if (isLeft) handleDoubleTap("left");
    } else if (tapCount === 3) {
      if (isMiddle) handleTripleTap("middle");
      if (isRight) handleTripleTap("right");
      if (isLeft) handleTripleTap("left");
    }

    // Reset tap count after a delay
    resetTapCount();
  };
  if (!p) {
    return <div>Loading...</div>; // Handle the case where `p` is undefined
  }

 
 
  return (
    <div className="post">
      <div className="post__avatar" onClick={handleUserClick} >
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
        {video && (
          <div
            
            onTouchStart={handleTap} // Add touch event listener for gestures
          >
            <div>
            <video
              ref={videoRef}
              src={video}
              controls
              style={{
                width: "auto",
               
              }}
            />
            </div>
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

export default Comments;