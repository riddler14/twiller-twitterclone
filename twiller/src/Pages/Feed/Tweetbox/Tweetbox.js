import React, { useState,useRef }  from 'react'
import "./Tweetbox.css";
import { Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import MicIcon from "@mui/icons-material/Mic"; // For audio icon
import axios from "axios";
import { useUserAuth } from "../../../context/UserAuthContext";
import useLoggedinuser from "../../../hooks/useLoggedinuser";

const Tweetbox=()=>{
    const [post, setpost] = useState("");
    const [imageurl, setimageurl] = useState("");
    const [isloading, setisloading] = useState(false);
    const [name, setname] = useState("");
    const [username, setusername] = useState("");
    const [audioBlob, setAudioBlob] = useState(null); // Store recorded audio blob
  const [isRecording, setIsRecording] = useState(false); // Track recording state
  const [otpVerified, setOtpVerified] = useState(false); // Track OTP verification
  const [openPopup, setOpenPopup] = useState(false); // Control audio popup
  const mediaRecorderRef = useRef(null); // Reference for MediaRecorder
  const chunksRef = useRef([]); // Store recorded audio chunks
    const { user } = useUserAuth();
    const [loggedinsuer] = useLoggedinuser();
    const email = user?.email;
    const userprofilepic = loggedinsuer[0]?.profileImage
      ? loggedinsuer[0].profileImage
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
    
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
            setAudioBlob(audioBlob);
          };
    
          mediaRecorderRef.current.start();
          setIsRecording(true);
        } catch (error) {
          console.error("Error accessing microphone:", error);
        }
      };
    
      // Function to stop recording audio
      const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      };
    
      // Function to validate audio size and duration
      const validateAudio = (blob) => {
        const fileSizeInMB = blob.size / (1024 * 1024); // Convert bytes to MB
        const durationInSeconds = Math.floor(blob.duration); // Duration in seconds
    
        return fileSizeInMB <= 100 && durationInSeconds <= 300; // 100MB and 5 minutes
      };
    
      // Function to check if current time is within 2 PM to 7 PM IST
      const isWithinTimeRange = () => {
        const now = new Date();
        const istOffset = 330; // IST offset in minutes
        const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
        const hours = istTime.getUTCHours();
        return hours >= 14 && hours < 19; // 2 PM to 7 PM IST
      };
    
      // Function to send OTP to email
      const sendOtp = async () => {
        try {
          await axios.post("https://twiller-twitterclone-1-j9kj.onrender.com/send-otp", { email });
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
          const response = await axios.post("https://twiller-twitterclone-1-j9kj.onrender.com/verify-otp", { email, otp });
          if (response.data.success) {
            setOtpVerified(true);
            alert("OTP verified successfully!");
          } else {
            alert("Invalid OTP. Please try again.");
          }
        } catch (error) {
          console.error("Error verifying OTP:", error);
        }
      };
    
      // Function to handle tweet submission
      const handletweet = (e) => {
        e.preventDefault();
        console.log("Tweet submission started");
      
        // Fetch user details if logged in with email/password
        if (user?.providerData[0]?.providerId === "password") {
          console.log("Fetching logged-in user data...");
          fetch(`https://twiller-twitterclone-1-j9kj.onrender.com/loggedinuser?email=${email}`)
            .then((res) => res.json())
            .then((data) => {
              console.log("Fetched user data:", data);
              setname(data[0]?.name);
              setusername(data[0]?.username);
            })
            .catch((error) => {
              console.error("Error fetching logged-in user data:", error);
            });
        } else {
          console.log("Setting username and name from user object...");
          setname(user?.displayName);
          setusername(email?.split("@")[0]);
        }
      
        // Ensure OTP is verified if audio is present
        if (audioBlob && !otpVerified) {
          console.log("OTP not verified. Exiting...");
          alert("Please verify OTP before posting.");
          return;
        }
      
        // Validate audio constraints if audio is present
        if (audioBlob && !validateAudio(audioBlob)) {
          console.log("Audio validation failed. Exiting...");
          alert("Audio must be less than 5 minutes and 100MB.");
          return;
        }
      
        // Validate time range if audio is present
        if (audioBlob && !isWithinTimeRange()) {
          console.log("Time range validation failed. Exiting...");
          alert("You can only upload audio between 2 PM and 7 PM IST.");
          return;
        }
      
        // Prepare tweet data
        const formData = new FormData();
        if (audioBlob) {
          formData.append("audio", audioBlob);
        }
      
        // Upload audio if present
        if (audioBlob) {
          console.log("Uploading audio...");
          axios
            .post("https://twiller-twitterclone-1-j9kj.onrender.com/upload-audio", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
              console.log("Audio uploaded successfully:", res.data.url);
              const audioUrl = res.data.url;
      
              const userPost = {
                profilephoto: userprofilepic,
                post: post,
                photo: imageurl,
                audio: audioUrl || null,
                username: username,
                name: name,
                email: email,
              };
      
              // Post the tweet
              console.log("Posting tweet...");
              fetch("https://twiller-twitterclone-1-j9kj.onrender.com/post", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(userPost),
              })
                .then((res) => res.json())
                .then((data) => {
                  console.log("Tweet posted successfully:", data);
                  setpost("");
                  setimageurl("");
                  setAudioBlob(null);
                  setOpenPopup(false); // Close popup after successful post
                  setOtpVerified(false); // Reset OTP verification
                })
                .catch((error) => {
                  console.error("Error posting tweet:", error);
                });
            })
            .catch((error) => {
              console.error("Error uploading audio:", error);
            });
        } else {
          // Post without audio
          console.log("Posting tweet without audio...");
          const userPost = {
            profilephoto: userprofilepic,
            post: post,
            photo: imageurl,
            audio: null,
            username: username,
            name: name,
            email: email,
          };
      
          fetch("https://twiller-twitterclone-1-j9kj.onrender.com/post", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(userPost),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("Tweet posted successfully:", data);
              setpost("");
              setimageurl("");
            })
            .catch((error) => {
              console.error("Error posting tweet:", error);
            });
        }
      };
    
    return (
        <div className="tweetBox">
      <form onSubmit={handletweet}>
        <div className="tweetBox__input">
          <Avatar
            src={
              loggedinsuer[0]?.profileImage
                ? loggedinsuer[0].profileImage
                : user && user.photoURL
            }
          />
          <input
            type="text"
            placeholder="What's happening?"
            onChange={(e) => setpost(e.target.value)}
            value={post}
            required
          />
          </div>
        <div className="imageIcon_tweetButton">
          <label htmlFor="image" className="imageIcon">
            {
              isloading ?<p>Uploading Image</p>:<p>{imageurl ? "Image Uploaded":<AddPhotoAlternateOutlinedIcon />}</p>
            }
          </label>
          <input
            type="file"
            id="image"
            className="imageInput"
            onChange={handleuploadimage}
          />

          {/* Audio Icon */}
          <Button onClick={() => setOpenPopup(true)}>
            <MicIcon />
          </Button>

          <Button className="tweetBox__tweetButton" type="submit">
            Post
          </Button>
        </div>
      </form>

      {/* Audio Recording Popup */}
      <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
        <DialogTitle>Record Audio</DialogTitle>
        <DialogContent>
          <Button onClick={startRecording} disabled={isRecording}>
            {isRecording ? "Recording..." : "Start Recording"}
          </Button>
          <Button onClick={stopRecording} disabled={!isRecording}>
            Stop Recording
          </Button>
          {audioBlob && <p>Audio Recorded Successfully!</p>}
          <Button onClick={sendOtp}>Send OTP</Button>
          <input type="text" id="otpInput"placeholder="Enter OTP" />
          <Button onClick={verifyOtp}>Verify OTP

           
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPopup(false)}>Cancel</Button>
          <Button type="submit" form="tweetForm">
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    );
};
export default Tweetbox;