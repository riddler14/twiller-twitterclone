import {useState,useRef,useEffect} from "react";
import { Avatar } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from "../../Feed/Posts/ConfirmationModal";
import "../../Feed/Posts/Posts.css";
const Post = ({p}) => {
    const { name, username, photo, post,audio,video,email } = p;
     const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate=useNavigate();
      // Fetch user's _id based on email
    
      const videoRef = useRef(null); // Reference to the video element
      const [tapCount, setTapCount] = useState(0);
        const [subscriptionPlan, setSubscriptionPlan] = useState("free");
    const [profilePhoto, setProfilePhoto] = useState("");
      let tapTimeout = null; // Timeout for resetting tap count
    const resetTapCount = () => {
      clearTimeout(tapTimeout); // Clear any existing timeout
      tapTimeout = setTimeout(() => setTapCount(0), 300); // Reset tap count after 300ms // 500ms timeout for multi-tap detection
    };
     useEffect(() => {
    // Fetch the profile image when the component mounts
    const fetchAndSetProfilePhoto = async () => {
      const profileImage = await fetchProfileImage(email); // Use the email from the post
      setProfilePhoto(profileImage);
    };

    fetchAndSetProfilePhoto();
  }, [email]);

  const fetchProfileImage = async (email) => {
  try {
    const response = await fetch(`https://twiller-twitterclone-2-q41v.onrender.com/userprofile?email=${email}`);
    if (!response.ok) {
      throw new Error("Failed to fetch profile image");
    }
    const data = await response.json();
    return data.user.profileImage || "default-profile-image-url"; // Fallback to default image
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return "default-profile-image-url"; // Fallback to default image
  }
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
        console.log("Forwarded 10 seconds: ",video.currentTime+10);
        video.currentTime +=10; // Move 10 seconds forward
        console.log("Forwarded 10 seconds: ",video.currentTime+10);
      } else if (direction === "left") {
        video.currentTime = Math.max(video.currentTime - 10, 0); // Move 10 seconds backward
        console.log("Reversed 10 seconds");
      }
      console.log("Current time after update:", video.currentTime);
  
    };
  
    const handleSingleTap = () => {
      const video = videoRef.current;
      if (!video) return;
  
      if (video.paused) {
        video.play(); // Resume playback
      } else {
        video.pause(); // Pause playback
      }
    };
  
    const handleTripleTap = (position) => {
      switch (position) {
        case "middle":
          alert("Moving to the next video..."); // Replace with logic to move to the next video
          break;
        case "right":
          
         setIsModalOpen(true);
          break;
        case "left":
          alert("Showing comment section...");
          navigate(`/home/feed/${p._id}`);// Replace with logic to show the comment section
          break;
        default:
          break;
      }
    };
  
    const handleTap = (e) => {
      e.preventDefault();
      const rect = e.target.getBoundingClientRect(); // Get the video element's bounding box
      const width = rect.width;
    
      // Use clientX for mouse/touch position
      const tapX = e.clientX || e.touches?.[0]?.clientX; // Support both mouse and touch
    
      // Determine tap position (left, middle, right)
      const isLeft = tapX < rect.left + width / 3;
      const isRight = tapX > rect.left + (width * 2) / 3;
      const isMiddle = !isLeft && !isRight;
      console.log("Tap position:", { isLeft, isMiddle, isRight });
  
      // Increment tap count
      const newTapCount = tapCount + 1;
      setTapCount((prevTapCount) => prevTapCount + 1);
  
    
      // Handle gestures based on tap count
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
    
      // Reset tap count after a delay
      resetTapCount();
    };
  
    const handlePostClick = () => {
      console.log(p._id);
      navigate(`/home/feed/${p._id}`);
    };
   
    const handleConfirm = () => {
      setIsModalOpen(false); // Close the modal
      try {
        window.close(); // Attempt to close the tab
      } catch (error) {
        window.alert("Unable to close the tab. Please close it manually.");
      }
    };
  
    const handleCancel = () => {
      setIsModalOpen(false); // Close the modal without taking any action
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


  // Determine the verified icon based on the subscription plan
  const getVerifiedIcon = () => {
    switch (subscriptionPlan) {
      case "bronze":
        return <VerifiedUserIcon className="verified-icon bronze" />;
      case "silver":
        return <VerifiedUserIcon className="verified-icon silver" />;
      case "gold":
        return <VerifiedUserIcon className="verified-icon gold" />;
      default:
        return <VerifiedUserIcon className="post__badge"/>; // No icon for "free" plan
    }
  };
    return (
      <div className="post">
        <div className="post__avatar">
          <Avatar src={profilePhoto} />
        </div>
        <div className="post__body">
          <div className="post__header">
            <div className="post__headerText">
              <h3>
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
                    controls
                    controlsList="nofullscreen"
                    className="post__video"
                    onPointerDown={handleTap}
                    
                  />
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
  }

export default Post;