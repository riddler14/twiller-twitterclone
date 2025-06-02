import { useState, useRef, useEffect } from "react";
import "./Posts.css";
import { Avatar } from "@mui/material";
import axios from "axios";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useNavigate } from "react-router-dom";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import ConfirmationModal from "./ConfirmationModal";

const Posts = ({ p, posts }) => {
  const { name, username, photo, post, audio, video, email } = p;
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loggedinuser] = useLoggedinuser();
  const loggedInEmail = loggedinuser[0]?.email;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef(null);
  const [tapCount, setTapCount] = useState(0);
  let tapTimeout = null;

  useEffect(() => {
    const fetchAndSetProfilePhoto = async () => {
      const profileImage = await fetchProfileImage(email);
      setProfilePhoto(profileImage);
    };

    fetchAndSetProfilePhoto();
  }, [email]);

  const fetchUserId = async (email) => {
    try {
      const response = await axios.get(
        `https://twiller-twitterclone-2-q41v.onrender.com/userprofile?email=${encodeURIComponent(
          email
        )}`
      );
      if (response.data.user) {
        setUserId(response.data.user._id);
        return response.data.user._id;
      } else {
        console.error("User not found for email:", email);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  const fetchProfileImage = async (email) => {
    try {
      const response = await fetch(`https://twiller-twitterclone-2-q41v.onrender.com/userprofile?email=${email}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile image");
      }
      const data = await response.json();
      return data.user.profileImage || "default-profile-image-url";
    } catch (error) {
      console.error("Error fetching profile image:", error);
      return "default-profile-image-url";
    }
  };

  const handleUserClick = async () => {
    if (!email) {
      console.error("Email is missing.");
      alert("This post does not have a valid email.");
      return;
    }

    if (!loggedInEmail) {
      alert("this action can't be completed");
      return;
    }

    let currentUserId = userId;

    if (!currentUserId) {
      currentUserId = await fetchUserId(email);
      if (!currentUserId) {
        alert("Could not retrieve user profile.");
        return;
      }
    }

    if (email === loggedInEmail) {
      alert("This is your profile!");
    } else {
      navigate(`/home/profile/${currentUserId}`);
    }
  };

  const resetTapCount = () => {
    clearTimeout(tapTimeout); // Clear any existing timeout
    // Set a new timeout to reset tap count if no further taps occur within the delay
    tapTimeout = setTimeout(() => {
      setTapCount(0);
      tapTimeout = null; // Clear the timeout reference
    }, 500); // Changed from 300ms to 500ms for better multi-tap detection
  };

  const handleDoubleTap = (direction) => {
    const video = videoRef.current;
    if (!video) {
      console.error("Video reference is not set.");
      return;
    }
    if (video.readyState < 2) {
      console.error("Video is not ready to play.");
      return;
    }
    console.log("Current time before update:", video.currentTime);
    console.log("Seekable range:", video.seekable.start(0), "-", video.seekable.end(0));
    if (direction === "right") {
      console.log("Forwarded 10 seconds: ", video.currentTime + 10);
      video.currentTime += 10;
      console.log("Forwarded 10 seconds: ", video.currentTime + 10);
    } else if (direction === "left") {
      video.currentTime = Math.max(video.currentTime - 10, 0);
      console.log("Reversed 10 seconds");
    }
    console.log("Current time after update:", video.currentTime);
  };

  const handleSingleTap = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTripleTap = (position) => {
    switch (position) {
      case "middle":
        const currentIndex = posts.findIndex((item) => item._id === p._id);
        const nextPostWithVideo = posts.slice(currentIndex + 1).find((item) => item.video);

        if (nextPostWithVideo) {
          navigate(`/home/feed/${nextPostWithVideo._id}`);
        } else {
          alert("No further video posts available.");
        }
        break;
      case "right":
        setIsModalOpen(true);
        break;
      case "left":
        alert("Showing comment section...");
        navigate(`/home/feed/${p._id}`);
        break;
      default:
        break;
    }
  };

  const handleTap = (e) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const width = rect.width;
    const tapX = e.clientX || e.touches?.[0]?.clientX;
    const isLeft = tapX < rect.left + width / 3;
    const isRight = tapX > rect.left + (width * 2) / 3;
    const isMiddle = !isLeft && !isRight;
    console.log("Tap position:", { isLeft, isMiddle, isRight });

    const newTapCount = tapCount + 1;
    setTapCount((prevTapCount) => prevTapCount + 1);

    if (newTapCount === 1) {
      if (isMiddle) {
        handleSingleTap();
      }
    } else if (newTapCount === 2) {
      if (isRight) handleDoubleTap("right");
      if (isLeft) handleDoubleTap("left");
    } else if (newTapCount === 3) {
      if (isMiddle) handleTripleTap("middle");
      if (isRight) handleTripleTap("right");
      if (isLeft) handleTripleTap("left");
    }

    resetTapCount();
  };

  const handlePostClick = () => {
    console.log(p._id);
    navigate(`/home/feed/${p._id}`);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    localStorage.removeItem("userEmail");
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAdmin");
    window.location.href = "https://www.google.com";
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchSubscriptionPlan = async () => {
      try {
        const response = await fetch(`https://twiller-twitterclone-2-q41v.onrender.com/subscription?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          setSubscriptionPlan(data.subscriptionPlan);
        } else {
          console.error("Error fetching subscription plan:", data.error);
        }
      } catch (error) {
        console.error("Error fetching subscription plan:", error);
      }
    };

    fetchSubscriptionPlan();
  }, [email]);

  const getVerifiedIcon = () => {
    switch (subscriptionPlan) {
      case "bronze":
        return <VerifiedUserIcon className="verified-icon bronze" />;
      case "silver":
        return <VerifiedUserIcon className="verified-icon silver" />;
      case "gold":
        return <VerifiedUserIcon className="verified-icon gold" />;
      default:
        return <VerifiedUserIcon className="post__badge" />;
    }
  };

  return (
    <div className="post">
      <div className="post__avatar" onClick={handleUserClick}>
        <Avatar src={profilePhoto} />
      </div>
      <div className="post__body">
        <div className="post__header">
          <div className="post__headerText">
            <h3 onClick={handleUserClick} className="user_name">
              {name}{" "}
              <span className="post__headerSpecial">
                {getVerifiedIcon()} @{username}
              </span>
            </h3>
          </div>
          <div className="post__headerDescription" onClick={handlePostClick}>
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
          <div className="post__video-wrapper">
            <video
              ref={videoRef}
              src={video}
              controlsList="nofullscreen"
              className="post__video"
              onPointerDown={(e) => {
                e.preventDefault();
                handleTap(e);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTap(e);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <div className="play-overlay" onClick={handleSingleTap}>
                <PlayArrowIcon className="play-icon" />
              </div>
            )}
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
      <ConfirmationModal
        isOpen={isModalOpen}
        message="Are you sure you want to leave the website?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Posts;