import React, { useState, useRef } from "react";
import "./Tweetbox.css";
import {
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import MicIcon from "@mui/icons-material/Mic"; // For audio icon
import axios from "axios";
import { useUserAuth } from "../../../context/UserAuthContext";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import { useTranslation } from "react-i18next";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Import a checkmark icon
import CancelIcon from "@mui/icons-material/Cancel"; // Import a cancel icon for removing video

const Tweetbox = ({onPostSuccess}) => {
  const [post, setpost] = useState("");
  const [imageurl, setimageurl] = useState("");
  const [isloading, setisloading] = useState(false); // Used for image upload loading
  const { t } = useTranslation();

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
  const [isLoadingVideo, setIsLoadingVideo] = useState(false); // Separate loading state for video
  const [videoFile, setVideoFile] = useState(null); // Store selected video file
  const [videoUrl, setVideoUrl] = useState(""); // Store video preview URL (now just for existence check)

  const mediaRecorderRef = useRef(null); // Reference for MediaRecorder
  const chunksRef = useRef([]); // Store recorded audio chunks
  const audioRef = useRef(null); // Reference for Audio object
  const timerIntervalRef = useRef(null); // Store interval ID for play timer

  const { user } = useUserAuth();
  const [loggedinuser] = useLoggedinuser();
  const email = user?.email;
  const userprofilepic = loggedinuser[0]?.profileImage
    ? loggedinuser[0]?.profileImage
    : user && user.photoURL;
  const name = loggedinuser[0]?.name;
  const username = loggedinuser[0]?.username
    ? loggedinuser[0].username
    : email?.split("@")[0];

  const handleuploadimage = (e) => {
    const image = e.target.files[0];
    if (!image) return; // Client-side validation for image size (e.g., 5MB)

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    if (image.size > MAX_IMAGE_SIZE) {
      alert("Image must be less than 5MB.");
      e.target.value = ""; // Clear the input
      setimageurl("");
      return;
    } // Client-side validation for image type

    if (!["image/jpeg", "image/png", "image/gif"].includes(image.type)) {
      alert("Only JPEG, PNG, and GIF formats are allowed for images.");
      e.target.value = ""; // Clear the input
      setimageurl("");
      return;
    }

    setisloading(true); // This state is for image loading
    const formData = new FormData();
    formData.set("image", image);
    axios
      .post(
        "https://api.imgbb.com/1/upload?key=131172eab64930e16173f6f8467ba9a6",
        formData
      )
      .then((res) => {
        setimageurl(res.data.data.display_url);
        console.log(res.data.data.display_url);
        setisloading(false);
      })
      .catch((e) => {
        console.error("Error uploading image:", e);
        alert("An error occurred while uploading the image. Please try again.");
        setisloading(false);
        setimageurl(""); // Clear image URL on error
      });
    e.target.value = ""; // Clear the input field for next upload
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
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

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const durationInSeconds = Math.floor(audioBuffer.duration);
        const formattedDuration = formatTime(durationInSeconds);
        setAudioDuration(formattedDuration);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      const intervalId = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      setTimerInterval(intervalId);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerInterval);
      setTimerInterval(null);
      setRecordingTime(0);
    }
  };

  const handlePlayAudio = () => {
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audioRef.current = audio;
    audio.play();
    setIsPlaying(true);
    timerIntervalRef.current = setInterval(() => {
      setPlayTime((prevTime) => prevTime + 1);
    }, 1000);
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

  const validateAudio = async (blob) => {
    try {
      const fileSizeInMB = blob.size / (1024 * 1024);
      if (fileSizeInMB >= 100) {
        console.error("Audio file size exceeds 100MB");
        return false;
      }
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const durationInSeconds = audioBuffer.duration;
      if (durationInSeconds >= 300) {
        console.error("Audio duration exceeds 5 minutes");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error validating audio:", error);
      return false;
    }
  };

  const isWithinTimeRange = () => {
    const now = new Date();
    const istOffset = 330; // IST offset in minutes (UTC+5:30)
    const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
    const hours = istTime.getUTCHours(); // Allow posting between 2 PM (14:00) and 7 PM (19:00) IST
    if (hours >= 14 && hours < 19) {
      return true;
    }
    return false;
  };

  const sendOtp = async () => {
    try {
      await axios.post(
        "https://twiller-twitterclone-2-q41v.onrender.com/send-otp",
        { email }
      );
      alert("OTP sent to your email. Please verify.");
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const verifyOtp = async () => {
    const otp = document.getElementById("otpInput").value.trim();
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
      const response = await axios.post(
        "https://twiller-twitterclone-2-q41v.onrender.com/verify-otp",
        { email, otp }
      );
      if (response.data.success) {
        setOtpVerified(true);
        setIsAudioAttached(true);
        setOpenPopup(false);
        alert("OTP verified successfully!");
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  const handletweet = async (e) => {
    e.preventDefault();

    if (audioBlob && !otpVerified) {
      alert("Please verify OTP before posting.");
      return;
    }
    if (audioBlob && !(await validateAudio(audioBlob))) {
      alert("Audio must be less than 5 minutes and 100MB.");
      return;
    }
    if (audioBlob && !isWithinTimeRange()) {
      alert("You can only upload audio between 2 PM and 7 PM IST.");
      return;
    }

    const followCount = loggedinuser[0]?.followCount || 0;
    const posts = await fetch(
      `https://twiller-twitterclone-2-q41v.onrender.com/userpost?email=${loggedinuser[0]?.email}`
    ).then((res) => res.json());

    const now = new Date();
    const currentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const postsToday = posts.filter((post) => {
      const postDate = new Date(post.createdAt);
      return postDate >= currentDate;
    });

    if (followCount === 0) {
      const isWithinPostingWindow = () => {
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);
        const hours = istTime.getUTCHours();
        const minutes = istTime.getUTCMinutes();
        return hours === 10 && minutes >= 0 && minutes <= 30;
      };

      if (!isWithinPostingWindow()) {
        alert("You can only post between 10:00 AM and 10:30 AM IST.");
        resetForm();
        return;
      }
      if (postsToday.length > 0) {
        alert("You have already posted today.");
        resetForm();
        return;
      }
    } else if (followCount > 0 && followCount < 10) {
      const maxPostsPerDay = followCount <= 2 ? 2 : 5;
      if (postsToday.length >= maxPostsPerDay) {
        alert(`You can only post ${maxPostsPerDay} times a day.`);
        resetForm();
        return;
      }
    }

    const formData = new FormData();
    if (audioBlob) formData.append("audio", audioBlob);
    if (videoFile) formData.append("video", videoFile);

    try {
      let audioUrl = null;
      let videoUploadUrl = null; // Use a distinct variable name for the uploaded video URL

      if (audioBlob) {
        console.log("Uploading audio...");
        const audioResponse = await axios.post(
          "https://twiller-twitterclone-2-q41v.onrender.com/upload-audio",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        audioUrl = audioResponse.data.url;
        console.log("Audio uploaded successfully:", audioUrl);
      }

      if (videoFile) {
        console.log("Uploading video...");
        const videoFormData = new FormData(); // Create new FormData for video
        videoFormData.append("video", videoFile); // Append only video to it
        const videoResponse = await axios.post(
          "https://twiller-twitterclone-2-q41v.onrender.com/upload-video",
          videoFormData, // Use the new FormData for video
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        videoUploadUrl = videoResponse.data.url; // Assign to the new variable
        console.log("Video uploaded successfully:", videoUploadUrl);
      }

      const userPost = {
        profilephoto: userprofilepic,
        post: post,
        photo: imageurl,
        audio: audioUrl,
        video: videoUploadUrl, // Use the uploaded video URL here
        username: username,
        name: name,
        email: email,
      };

      const postResponse = await fetch(
        "https://twiller-twitterclone-2-q41v.onrender.com/post",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(userPost),
        }
      );
      if (!postResponse.ok) {
        const errorData = await postResponse.json();
        alert(errorData.error || "An unknown error occurred.");
        resetForm();
        if (errorData.details) {
          alert((prev) => `${prev} ${errorData.details}`);
        }
        return;
      }
      const postData = await postResponse.json();
      console.log("Tweet posted successfully:", postData);
      resetForm();

      if (onPostSuccess) {
                onPostSuccess();
            }
    } catch (error) {
      console.error("Error during tweet submission:", error);
      alert("An error occurred while posting the tweet. Please try again.");
      resetForm();
    }
  };

  const resetForm = () => {
    setpost("");
    setimageurl("");
    setAudioBlob(null);
    setVideoUrl(""); // Clear the video preview URL
    setVideoFile(null); // Clear the video file
    setIsAudioAttached(false);
    setOpenPopup(false);
    setOtpVerified(false);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      alert("Video must be less than 500MB.");
      e.target.value = ""; // Clear the input
      setVideoFile(null);
      setVideoUrl("");
      return;
    }
    if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
      alert("Only MP4, WebM, and Ogg formats are allowed.");
      e.target.value = ""; // Clear the input
      setVideoFile(null);
      setVideoUrl("");
      return;
    }
    setIsLoadingVideo(true); // Set loading for video
    try {
      setVideoFile(file); // Store the selected video file
      setVideoUrl(URL.createObjectURL(file)); // Create a temporary URL to indicate attachment
    } catch (error) {
      console.error("Error during video upload:", error);
      alert("An error occurred while handling the video. Please try again.");
    } finally {
      setIsLoadingVideo(false); // Stop loading regardless of success/failure
      e.target.value = ""; // Clear the input field for next upload
    }
  };

  return (
    <div className="tweetBox">
      {" "}
      <form onSubmit={handletweet}>
        {" "}
        <div className="tweetBox__input">
          {" "}
          <Avatar
            src={
              loggedinuser[0]?.profileImage
                ? loggedinuser[0].profileImage
                : user && user.photoURL
            }
          />{" "}
          <input
            type="text"
            placeholder={t("What's Happening?")}
            onChange={(e) => setpost(e.target.value)}
            value={post}
            required
          />{" "}
        </div>{" "}
        <div className="imageIcon_tweetButton">
          {imageurl ? ( // Show circle and remove button if image is attached
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {" "}
              <CheckCircleIcon
                style={{ color: "green", fontSize: "24px" }}
              />{" "}
              <span style={{ fontSize: "14px" }}>{t("Image Attached")}</span>{" "}
              <Button
                onClick={() => setimageurl("")}
                style={{ minWidth: "unset", padding: "0", color: "red" }}
              >
                <CancelIcon fontSize="small" />{" "}
              </Button>{" "}
            </div>
          ) : (
            // Show upload button if no image is attached
            <label htmlFor="image" className="imageIcon">
              {" "}
              {isloading ? (
                <p>{t("Uploading Image...")}</p>
              ) : (
                <AddPhotoAlternateOutlinedIcon />
              )}{" "}
            </label>
          )}{" "}
          <input
            type="file"
            id="image"
            accept="image/*"
            className="imageInput"
            onChange={handleuploadimage}
            style={{ display: "none" }} // Hide the actual input
          />
          {videoUrl ? ( // Show circle and remove button if video is attached
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {" "}
              <CheckCircleIcon
                style={{ color: "green", fontSize: "24px" }}
              />{" "}
              <span style={{ fontSize: "14px" }}>Video Attached</span>{" "}
              <Button
                onClick={() => {
                  setVideoFile(null);
                  setVideoUrl("");
                }}
                style={{ minWidth: "unset", padding: "0", color: "red" }}
              >
                <CancelIcon fontSize="small" />{" "}
              </Button>{" "}
            </div>
          ) : (
            // Show upload button if no video is attached
            <label htmlFor="video" className="videoIcon">
              {" "}
              {isLoadingVideo ? (
                <p>Uploading Video...</p>
              ) : (
                <VideoLibraryIcon
                  fontSize="medium"
                  style={{ color: "royalblue" }}
                />
              )}{" "}
            </label>
          )}{" "}
          <input
            type="file"
            id="video"
            accept="video/*"
            className="videoInput"
            onChange={handleVideoUpload}
            style={{ display: "none" }} // Hide the actual input
          />
          <Button onClick={() => setOpenPopup(true)}>
            <MicIcon />
          </Button>{" "}
          {isAudioAttached && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {" "}
              <p style={{ margin: "0 10px" }}>Audio Attached</p>{" "}
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  const audio = new Audio(URL.createObjectURL(audioBlob));
                  audio.play();
                }}
              >
                {t("Play")}{" "}
              </Button>{" "}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setAudioBlob(null);
                  setIsAudioAttached(false);
                }}
              >
                {t("Clear")}{" "}
              </Button>{" "}
            </div>
          )}{" "}
          <Button className="tweetBox__tweetButton" type="submit">
            {t("Post")}{" "}
          </Button>{" "}
        </div>{" "}
      </form>
      {/* Audio Recording Popup */}{" "}
      <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
        <DialogTitle>{t("Record Audio")}</DialogTitle>{" "}
        <DialogContent>
          {/* Start/Stop Recording Buttons */}{" "}
          <Button onClick={startRecording} disabled={isRecording}>
            {" "}
            {isRecording ? t("Recording...") : t("Start Recording")}{" "}
          </Button>{" "}
          <Button onClick={stopRecording} disabled={!isRecording}>
            {t("Stop Recording")}{" "}
          </Button>
          {isRecording && (
            <p>
              {t("Recording Time:")} {formatTime(recordingTime)}
            </p>
          )}{" "}
          {/* Display Success Message and Buttons if Audio is Recorded */}{" "}
          {audioBlob && (
            <div>
              {" "}
              <p>{`${audioDuration}  Audio Recorded Successfully!`}</p>{" "}
              <Button onClick={handlePlayAudio} disabled={isPlaying}>
                {t("Play")}{" "}
              </Button>{" "}
              <Button onClick={handlePauseAudio} disabled={!isPlaying}>
                {t("Pause")}{" "}
              </Button>{" "}
              <Button onClick={handleClearAudio}>{t("Clear")}</Button>{" "}
              {isPlaying && (
                <p>
                  {t("Playback Time:")} {formatTime(playTime)}
                </p>
              )}{" "}
            </div>
          )}{" "}
        </DialogContent>{" "}
        <DialogActions>
          {" "}
          <Button onClick={sendOtp}>{t("Send OTP")}</Button>{" "}
          <input id="otpInput" type="text" placeholder={t("Enter OTP")} />
          <Button onClick={verifyOtp}>{t("Verify OTP")}</Button>{" "}
          <Button onClick={() => setOpenPopup(false)}>{t("Cancel")}</Button>{" "}
        </DialogActions>{" "}
      </Dialog>{" "}
    </div>
  );
};
export default Tweetbox;
