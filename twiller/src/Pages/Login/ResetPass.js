import React, { useState} from 'react'
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import {getAuth,sendPasswordResetEmail} from "firebase/auth";
import { Link } from 'react-router-dom';
import axios from "axios";
import "./login.css";
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const ResetPass=()=>{
    const [email, setemail] = useState("");
    const {t}=useTranslation();
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    // const [isOtpSent, setIsOtpSent] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState(""); // Store the generated password
    // Tracks if OTP has been sent
    // const [isOtpVerified, setIsOtpVerified] = useState(false); // Tracks if OTP is verified
    const auth=getAuth();
    

    // Function to send OTP
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMessage("");

//     if (!email) {
//       setError("Email is required.");
//       return;
//     }

//     try {
//       const response = await fetch("https://twiller-twitterclone-2-q41v.onrender.com/send-reset-otp", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to send OTP.");
//       }

//       setMessage(data.message); // Display success message
//       setIsOtpSent(true); // Enable OTP input field
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMessage("");

//     if (!email || !otp) {
//       setError("Both email and OTP are required.");
//       return;
//     }

//     try {
//       const response = await fetch("https://twiller-twitterclone-2-q41v.onrender.com/verify-reset-otp", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, otp }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to verify OTP.");
//       }

//       setMessage("OTP verified successfully. You can now reset your password.");
//       setIsOtpVerified(true); // Enable new password fields
//     } catch (err) {
//       setError(err.message);
//     }
//   };
  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Only letters
    let password = "";
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    setGeneratedPassword(password); // Store the generated password
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
  
    if (!email) {
      setError("Email is required.");
      return;
    }
  
    try {
      // Step 1: Check permission with the backend
      const permissionResponse = await axios.post(
        "https://twiller-twitterclone-2-q41v.onrender.com/check-reset-permission",
        { email }
      );
  
      if (!permissionResponse.data.allowed) {
        setError(permissionResponse.data.error || "Permission denied.");
        return;
      }
  
      // Step 2: Send the reset email using Firebase
      await sendPasswordResetEmail(auth, email);
  
      setMessage("Password reset email sent successfully.");
    } catch (err) {
      console.error("Error sending reset email:", err);
      setError(err.response?.data?.error || "Failed to send reset email.");
    }
  };

    
  
    return(
        <>
            <div className="login-container">
        <div className="image-container">
          <img src={twitterimg} className=" image" alt="twitterimg" />
        </div>
        <div className="form-container">
          <div className="form-box">
            <TwitterIcon style={{ color: "skyblue" }} />
            <h2 className="heading">{t('Reset Password')}</h2>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <form onSubmit={
                handleResetPassword
              }>
              <input
                type="email"
                className="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                required
              />
             
            
              {/* New Password Fields (only visible after OTP is verified) */}
              
               
                <div className="password-field">
                    <button
                      type="button"
                      className="btn"
                      onClick={generateRandomPassword}
                    >
                      {t('Generate Random Password')}
                    </button>
                    &nbsp;
                    {generatedPassword && (
                      <input
                        type="text"
                        className="generated-password"
                        readOnly
                        value={generatedPassword}
                        placeholder="Generated Password"
                      />
                    )}
                  </div>
                  
                
              
              
              <div className="btn-login">
                <button type="submit" className="btn">
                  {t('Send Reset Mail')}
                </button>
              </div>
            </form>
            <hr/>
            {t('Wanna go back to login Page?')}
           <Link
                         to="/login"
                         style={{
                           textDecoration: "none",
                           color: "var(--twitter-color)",
                           fontWeight: "600",
                           marginLeft: "5px",
                         }}
                       >
                        {t('Log In')}
                       </Link>
          <LanguageSwitcher/>
            
            
          </div>
        
        </div>
      </div>
        </>
    );
};
export default ResetPass;