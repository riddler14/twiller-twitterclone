import React, { useState,useRef }  from 'react'
import "./CommentBox.css";
import { Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import MicIcon from "@mui/icons-material/Mic"; // For audio icon
import axios from "axios";
import { useUserAuth } from "../../../context/UserAuthContext";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import { useTranslation } from 'react-i18next';
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { useNavigate } from 'react-router-dom';
const CommentBox=({a})=>{
    const [post, setpost] = useState("");
    const [imageurl, setimageurl] = useState("");
    const [isloading, setisloading] = useState(false);
    const {t}=useTranslation();
    // const [errorMessage, setErrorMessage] = useState("");
    const [name, setname] = useState("");
    const [username, setusername] = useState("");
    const [audioBlob, setAudioBlob] = useState(null); // Store recorded audio blob
  const [isRecording, setIsRecording] = useState(false); // Track recording state
  const [otpVerified, setOtpVerified] = useState(false); // Track OTP verification
  const [openPopup, setOpenPopup] = useState(false); // Control audio popup
  const [isAudioAttached, setIsAudioAttached] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // Tracks elapsed recording time in seconds
const [timerInterval, setTimerInterval] = useState(null); // Stores the interval ID // Track if audio is attached
const [playTime, setPlayTime] = useState(0); // Track playback time
  const [isPlaying, setIsPlaying] = useState(false); // Track if audio is playing
  const [audioDuration, setAudioDuration] = useState(""); // Track audio duration
  const [isLoading,setIsLoading]=useState(false);
  const [videoFile, setVideoFile] = useState(null); // Store selected video file
  const [videoUrl, setVideoUrl] = useState(""); // Store video preview URL
  const authorPostId=a;
  const [author,setAuthor]=useState(null);
  const mediaRecorderRef = useRef(null); // Reference for MediaRecorder
  const chunksRef = useRef([]); // Store recorded audio chunks
  const audioRef = useRef(null); // Reference for Audio object
  const timerIntervalRef = useRef(null); // Store interval ID for play timer
  const [isFocused, setIsFocused] = useState(false); // Track focus state of the input
  const [showReplyText, setShowReplyText] = useState(false); // Show "R
  const navigate=useNavigate();
    const [userId, setUserId] = useState(null); // Store the user's _id locally
     // Assuming this hook provides the logged-in user's data
  
  
    const { user } = useUserAuth();
    const [loggedinuser] = useLoggedinuser();
    const loggedInEmail = loggedinuser[0]?.email;
    const email = user?.email;
    const userprofilepic = loggedinuser[0]?.profileImage
      ? loggedinuser[0].profileImage
      : user && user.photoURL;

      const handleuploadimage = (e) => {
        setisloading(true);
        const image = e.target.files[0];
        //console.log(image)
        const formData = new FormData();
        formData.set("image", image);
        axios.post("https://api.imgbb.com/1/upload?key=131172eab64930e16173f6f8467ba9a6 ", formData)
        .then((res) => {
          setimageurl(res.data.data.display_url);
          console.log(res.data.data.display_url);
          setisloading(false);
        })
        .catch((e) => {
          console.log(e);
        });
      };

      const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60)
          .toString()
          .padStart(2, "0"); // Ensure two digits
        const seconds = (timeInSeconds % 60).toString().padStart(2, "0"); // Ensure two digits
        return `${minutes}:${seconds}`;
      };
      const startRecording = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorderRef.current = new MediaRecorder(stream);
          chunksRef.current = [];
      
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunksRef.current.push(event.data);
            }
          };
      
          mediaRecorderRef.current.onstop = async() => {
            const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
            setAudioBlob(audioBlob);
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const durationInSeconds = Math.floor(audioBuffer.duration);

        // Format duration using the existing formatTime function
        const formattedDuration = formatTime(durationInSeconds);
        setAudioDuration(formattedDuration);
          };
      
          mediaRecorderRef.current.start();
          setIsRecording(true);
      
          // Start the recording timer
          const intervalId = setInterval(() => {
            setRecordingTime((prevTime) => prevTime + 1); // Increment time by 1 second
          }, 1000);
      
          setTimerInterval(intervalId); // Store the interval ID
        } catch (error) {
          console.error("Error accessing microphone:", error);
        }
      };
    
      // Function to stop recording audio
      const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      
          // Stop the recording timer
          clearInterval(timerInterval);
          setTimerInterval(null);
          setRecordingTime(0); // Reset the timer
        }
      };
      const handlePlayAudio = () => {
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audioRef.current = audio;
    
        // Start playing the audio
        audio.play();
        setIsPlaying(true);
    
        // Start the play timer
        timerIntervalRef.current = setInterval(() => {
          setPlayTime((prevTime) => prevTime + 1); // Increment time by 1 second
        }, 1000);
    
        // Reset the play timer when audio ends
        audio.addEventListener("ended", () => {
          clearInterval(timerIntervalRef.current);
          setPlayTime(0);
          setIsPlaying(false);
        });
      };
    
      const handlePauseAudio = () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
    
          // Stop the play timer
          clearInterval(timerIntervalRef.current);
        }
      };
    
      const handleClearAudio = () => {
        setAudioBlob(null);
        setIsAudioAttached(false);
        setIsPlaying(false);
        setPlayTime(0);
        clearInterval(timerIntervalRef.current);
      };
      // Function to validate audio size and duration
      const validateAudio = async (blob) => {
        try {
          // Validate file size (less than 100MB)
          const fileSizeInMB = blob.size / (1024 * 1024); // Convert bytes to MB
          if (fileSizeInMB >= 100) {
            console.error("Audio file size exceeds 100MB");
            return false;
          }

        
      
          // Validate duration using AudioContext (less than 5 minutes)
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const durationInSeconds = audioBuffer.duration;
      
          if (durationInSeconds >= 300) { // 5 minutes = 300 seconds
            console.error("Audio duration exceeds 5 minutes");
            return false;
          }
      
          // Both validations passed
          return true;
        } catch (error) {
          console.error("Error validating audio:", error);
          return false;
        }
      };
    
      // Function to check if current time is within 2 PM to 7 PM IST
      const isWithinTimeRange = () => {
        const now = new Date();
        const istOffset = 330; // IST offset in minutes (UTC+5:30)
        const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
        const hours = istTime.getUTCHours();
      
        // Allow posting between 2 PM (14:00) and 7 PM (19:00) IST
        if (hours >= 14 && hours < 19) {
          return true;
        }
        return false;
      };
    
      // Function to send OTP to email
      const sendOtp = async () => {
        try {
          await axios.post("https://twiller-twitterclone-2-q41v.onrender.com/send-otp", { email });
          alert("OTP sent to your email. Please verify.");
        } catch (error) {
          console.error("Error sending OTP:", error);
        }
      };
    
      // Function to verify OTP
      const verifyOtp = async () => {
        const otp = document.getElementById("otpInput").value.trim(); // Get OTP from input field
        console.log(otp);
      
        if (!otp) {
          alert("Please provide the OTP.");
          return;
        }
      
        if (!email) {
          alert("Email not found. Please log in again.");
          return;
        }
      
        try {
          const response = await axios.post("https://twiller-twitterclone-2-q41v.onrender.com/verify-otp", { email, otp });
          if (response.data.success) {
            setOtpVerified(true); // Mark OTP as verified
            setIsAudioAttached(true); // Mark audio as attached

            setOpenPopup(false); // Close the popup
            alert("OTP verified successfully!");
          } else {
            alert("Invalid OTP. Please try again.");
          }
        } catch (error) {
          console.error("Error verifying OTP:", error);
        }
      };
    
      // Function to handle tweet submission
      const handletweet = async (e) => {
        e.preventDefault();
        // setErrorMessage("");
      
        // Fetch user details
        if (user?.providerData[0]?.providerId === "password") {
          fetch(`https://twiller-twitterclone-2-q41v.onrender.com/loggedinuser?email=${email}`)
            .then((res) => res.json())
            .then((data) => {
              setname(data[0]?.name);
              setusername(data[0]?.username);
            });
        } else {
          setname(user?.displayName);
          setusername(email?.split("@")[0]);
        }
      
        // Ensure OTP is verified if audio is present
        if (audioBlob && !otpVerified) {
          alert("Please verify OTP before posting.");
          return;
        }
      
        // Validate audio constraints
        if (audioBlob && !validateAudio(audioBlob)) {
          alert("Audio must be less than 5 minutes and 100MB.");
          return;
        }
      
        // Validate time range
        if (audioBlob && !isWithinTimeRange()) {
          alert("You can only upload audio between 2 PM and 7 PM IST.");
          return;
        }
        
        const followCount = loggedinuser[0]?.followCount || 0;

    // Fetch posts made by the user
    const posts = await fetch(
      `https://twiller-twitterclone-2-q41v.onrender.com/userpost?email=${loggedinuser[0]?.email}`
    ).then((res) => res.json());

    // Filter posts to include only those made today
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Midnight of the current day
    const postsToday = posts.filter((post) => {
      const postDate = new Date(post.createdAt);
      return postDate >= currentDate; // Include only posts made today
    });

    // Apply posting rules based on follow count
    if (followCount === 0) {
      // User doesn't follow anyone
      const isWithinPostingWindow = () => {
        const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
        const istTime = new Date(now.getTime() + istOffset);

        const hours = istTime.getUTCHours();
        const minutes = istTime.getUTCMinutes();

        return hours === 10 && minutes >= 0 && minutes <= 30;
      };

      if (!isWithinPostingWindow()) {
        alert("You can only post between 10:00 AM and 10:30 AM IST.");
        setpost("");
        setimageurl("");
        setAudioBlob(null);
        setAuthor("");
        setVideoUrl(""); // Clear the video preview URL
        setVideoFile(null); // Clear the video file
        setIsAudioAttached(false); // Remove "Audio Attached" message
        setOpenPopup(false); // Close popup after successful post
        setOtpVerified(false);
        return;
      }

      if (postsToday.length > 0) {
        alert("You have already posted today.");
        setpost("");
        setimageurl("");
        setAudioBlob(null);
        setAuthor("");
        setVideoFile(null); // Clear the video file
        setIsAudioAttached(false); // Remove "Audio Attached" message
        setOpenPopup(false); // Close popup after successful post
        setOtpVerified(false);
        return;
      }
    } else if (followCount > 0 && followCount < 10) {
      // User follows 1–9 people
      const maxPostsPerDay = followCount <= 2 ? 2 : 5;

      if (postsToday.length >= maxPostsPerDay) {
        alert(`You can only post ${maxPostsPerDay} times a day.`);
        setpost("");
        setimageurl("");
        setAudioBlob(null);
        setAuthor("");
        setVideoFile(null); // Clear the video file
        setIsAudioAttached(false); // Remove "Audio Attached" message
        setOpenPopup(false); // Close popup after successful post
        setOtpVerified(false);
        return;
      }
    }
    
        // Prepare tweet data
        const formData = new FormData();
  if (audioBlob) formData.append("audio", audioBlob);
  if (videoFile) formData.append("video", videoFile);

  try {
    let audioUrl = null;
    let videoUrl = null;

    // Upload audio if present
    if (audioBlob) {
      console.log("Uploading audio...");
      const audioResponse = await axios.post(
        "https://twiller-twitterclone-2-q41v.onrender.com/upload-audio",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      audioUrl = audioResponse.data.url; // Get the audio URL from the response
      console.log("Audio uploaded successfully:", audioUrl);
    }

    // Upload video if present
    if (videoFile) {
      console.log("Uploading video...");
      const videoResponse = await axios.post(
        "https://twiller-twitterclone-2-q41v.onrender.com/upload-video",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      videoUrl = videoResponse.data.url; // Get the video URL from the response
      console.log("Video uploaded successfully:", videoUrl);
    }

    // Post the tweet with audio/video URLs
    const userPost = {
      profilephoto: userprofilepic,
      post: post,
      photo: imageurl,
      audio: audioUrl, // Use the audio URL here
      video: videoUrl,
      author:authorPostId, // Use the video URL here
      username: username,
      name: name,
      email: email,
    };

    const postResponse = await fetch("https://twiller-twitterclone-2-q41v.onrender.com/comment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userPost),
    });

    const postData = await postResponse.json();
    console.log("Tweet posted successfully:", postData);
    console.log("authot Id:", author);
    
    // Reset state after successful post
    setpost("");
    setimageurl("");
    setAudioBlob(null);
    setVideoUrl("");
    setAuthor("");
    setVideoFile(null); // Clear the video file
    setIsAudioAttached(false); // Remove "Audio Attached" message
    setOpenPopup(false); // Close popup after successful post
    setOtpVerified(false); // Reset OTP verification
  } catch (error) {
    console.error("Error during tweet submission:", error);
    alert("An error occurred while posting the tweet. Please try again.");
    setpost("");
    setimageurl("");
    setAudioBlob(null);
    setVideoUrl(""); // Clear the video preview URL
    setVideoFile(null);
    setAuthor(""); // Clear the video file
    setIsAudioAttached(false); // Remove "Audio Attached" message
    setOpenPopup(false); // Close popup after successful post
    setOtpVerified(false);
  }
      };
      const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
      
        // Validate video size and format
        if (file.size > 500 * 1024 * 1024) {
          alert("Video must be less than 500MB.");
          return;
        }
        if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
          alert("Only MP4, WebM, and Ogg formats are allowed.");
          return;
        }
        setIsLoading(true);
       try{ setVideoFile(file); // Store the selected video file
        setVideoUrl(URL.createObjectURL(file)); // Preview the video locally
       }catch(error){
        console.error("Error during video upload:", error);
    alert("An error occurred while uploading the video. Please try again.");
  } finally {
    setIsLoading(false); // Stop loading
  }
      };
      const handleFocus = () => {
        setIsFocused(true);
        setShowReplyText(true);
      };
    
      
      const fetchUserId = async (email) => {
          try {
            const response = await axios.get(
              `https://twiller-twitterclone-2-q41v.onrender.com/userprofile?email=${encodeURIComponent(email)}`
            );
      
            if (response.data.user) {
              setUserId(response.data.user._id); // Store the _id locally
            }   if (email === loggedInEmail) {
              alert("This is your profile!");
              navigate(`/home/profile`);
              
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
    return (
        <div className="tweetBox" onFocus={handleFocus}
       >
            {showReplyText && (
        <div className="reply-text">
          Replying to <span>@{username}</span>
        </div>
      )}
      <form onSubmit={handletweet}>
        <div className="tweetBox__input">
          <Avatar
            src={
              loggedinuser[0]?.profileImage
                ? loggedinuser[0].profileImage
                : user && user.photoURL
            }
            onClick={handleUserClick}
          />
          <input
            type="text"
            placeholder={t("Write a Comment...")}
            onChange={(e) => setpost(e.target.value)}
            value={post}
            
            required
          />
          </div>
         {isFocused &&(
        <div className="imageIcon_tweetButton">
          <label htmlFor="image" className="imageIcon">
            {
              isloading ?<p>{t('Uploading Image')}</p>:<p>{imageurl ? "Image Uploaded":<AddPhotoAlternateOutlinedIcon />}</p>
            }
          </label>
          <input
            type="file"
            id="image"
            className="imageInput"
            onChange={handleuploadimage}
            

          />
            {/* {errorMessage && <p className="error-message">{errorMessage}</p>} */}
            {videoUrl && (
        <div className="videoPreview">
          <video controls src={videoUrl} style={{ width: "100%" }} />
          <button onClick={() => setVideoUrl("")}>Remove Video</button>
        </div>
      )}

      {/* Video Upload Button */}
      <label htmlFor="video" className="videoIcon">
  {isLoading ? (
    <p>Uploading Video...</p>
  ) : (
    <VideoLibraryIcon fontSize="medium" style={{ color: "royalblue" }} />
  )}
</label>
<input
  type="file"
  id="video"
  accept="video/*"
  className="videoInput"
  onChange={handleVideoUpload}
  style={{ display: "none" }} // Hide the actual input
/>
          {/* Audio Icon */}
          <Button onClick={() => setOpenPopup(true)}>
            <MicIcon />
          </Button>
          {isAudioAttached && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <p style={{ margin: "0 10px" }}>Audio Attached</p>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const audio = new Audio(URL.createObjectURL(audioBlob));
                audio.play();
              }}
            >
              {t('Play')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setAudioBlob(null);
                setIsAudioAttached(false);
              }}
            >
              {t('Clear')}
            </Button>
          </div>
        )}



          <Button className="tweetBox__tweetButton" type="submit">
            {t('Comment')}
          </Button>
        </div>
)}
      </form>

      {/* Audio Recording Popup */}
      <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
      <DialogTitle>{t('Record Audio')}</DialogTitle>
      <DialogContent>
        {/* Start/Stop Recording Buttons */}
        <Button onClick={startRecording} disabled={isRecording}>
          {isRecording ? t("Recording...") : t("Start Recording")}
        </Button>
        <Button onClick={stopRecording} disabled={!isRecording}>
          {t('Stop Recording')}
        </Button>

        {/* Display Recording Timer */}
        {isRecording && <p>{t('Recording Time:')} {formatTime(recordingTime)}</p>}

        {/* Display Success Message and Buttons if Audio is Recorded */}
        {audioBlob && (
          <div>
            <p>{`${audioDuration}  Audio Recorded Successfully!`}</p>
            <Button onClick={handlePlayAudio} disabled={isPlaying}>
              {t('Play')}
            </Button>
            <Button onClick={handlePauseAudio} disabled={!isPlaying}>
              {t('Pause')}
            </Button>
            <Button onClick={handleClearAudio}>{t('Clear')}</Button>
            {isPlaying && <p>{t('Playback Time:')} {formatTime(playTime)}</p>}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        {/* OTP Actions */}
        <Button onClick={sendOtp}>{t('Send OTP')}</Button>
        <input id="otpInput" type="text" placeholder={t("Enter OTP")} />
        <Button onClick={verifyOtp}>{t('Verify OTP')}</Button>
        <Button onClick={() => setOpenPopup(false)}>{t('Cancel')}</Button>
      </DialogActions>
    </Dialog>
    </div>
    );
};
export default CommentBox;