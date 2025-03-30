import React, { useState} from 'react'
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";

import { useNavigate } from "react-router-dom";
import "./login.css";

const ResetPass=()=>{
    const [email, setemail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false); // Tracks if OTP has been sent
    const [isOtpVerified, setIsOtpVerified] = useState(false); // Tracks if OTP is verified
    const navigate = useNavigate();
    
    // Function to send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      const response = await fetch("/send-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP.");
      }

      setMessage(data.message); // Display success message
      setIsOtpSent(true); // Enable OTP input field
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !otp) {
      setError("Both email and OTP are required.");
      return;
    }

    try {
      const response = await fetch("/verify-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP.");
      }

      setMessage("OTP verified successfully. You can now reset your password.");
      setIsOtpVerified(true); // Enable new password fields
    } catch (err) {
      setError(err.message);
    }
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setMessage("Password reset successfully.");
      navigate("/"); // Redirect to home page or login page
    } catch (err) {
      setError(err.message);
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
            <h2 className="heading">Reset Password</h2>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <form onSubmit={
                isOtpVerified ? handleResetPassword : isOtpSent ? handleVerifyOtp : handleSendOtp
              }>
              <input
                type="email"
                className="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                required
              />
              {isOtpSent && (
              <input
                type="OTP"
                className="password"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />)}

              {/* New Password Fields (only visible after OTP is verified) */}
              {isOtpVerified && (
                <>
                  <input
                    type="password"
                    className="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    className="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </>
              )}
              <div className="btn-login">
                <button type="submit" className="btn">
                  {isOtpVerified ? "Reset Password" : isOtpSent ? "Verify OTP" : "Send OTP"}
                </button>
              </div>
            </form>
            <hr />
            
            
          </div>
        
        </div>
      </div>
        </>
    );
};
export default ResetPass;