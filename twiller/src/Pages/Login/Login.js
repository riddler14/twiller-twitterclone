import React, { useState } from "react";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { useUserAuth } from "../../context/UserAuthContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import axios from "axios";

const Login = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  // const [isOtpSent, setIsOtpSent] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false); // Controls the OTP popup visibility
  const [error, setError] = useState("");
  const [googleEmail, setGoogleEmail] = useState(""); // Email retrieved from Google Sign-In
  const navigate = useNavigate();
  const { googleSignin, logIn } = useUserAuth();

 const userAgent = navigator.userAgent;
  // Robust mobile device detection
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|Opera Mini/i.test(userAgent);
  
  // Helper to accurately identify the browser type
  const getBrowserInfo = () => {
    // Order matters: check for Edge first as its User-Agent string also contains "Chrome"
    if (userAgent.includes("Edg")) return "Edge"; // Microsoft Edge (Chromium-based)
    // Check for Chrome, excluding other Chromium-based browsers or webviews
    if (userAgent.includes("Chrome") && !userAgent.includes("CriOS") && !userAgent.includes("FxiOS") && !userAgent.includes("wv")) return "Chrome"; // Google Chrome (desktop or Android)
    if (userAgent.includes("Firefox")) return "Firefox"; // Mozilla Firefox
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari"; // Apple Safari (ensure it's not Chrome pretending to be Safari)
    if (userAgent.includes("CriOS")) return "Chrome (iOS)"; // Chrome on iOS
    if (userAgent.includes("FxiOS")) return "Firefox (iOS)"; // Firefox on iOS
    return "Other"; // Catch-all for any other browser
  };

  const getOSInfo = () => {
    if (/Windows/i.test(userAgent)) return "Windows";
    if (/Macintosh|Mac OS X/i.test(userAgent)) return "Mac";
    if (/Linux/i.test(userAgent)) return "Linux";
    if (/Android/i.test(userAgent)) return "Android";
    if (/iOS|iPad|iPhone|iPod/i.test(userAgent)) return "iOS";
    return "Other";
  };

  const getDeviceInfo = () => {
    return isMobile ? "Mobile" : "Desktop";
  };

  // --- IMPORTANT CHANGE HERE: Updated isLoginAllowed() ---
  // This function determines if a login attempt is allowed to proceed at all.
  const isLoginAllowed = () => {
    const now = new Date();
    const currentHour = now.getHours(); // 0-23

    // Rule: Mobile devices are ONLY allowed to log in between 10 AM and 1 PM.
    // If it's a mobile device AND it's *outside* this 10 AM to 1 PM window, block login.
    if (isMobile && !(currentHour >= 10 && currentHour < 13)) {
      const errorMessage = t("Access on mobile devices is only allowed between 10 AM and 1 PM. Please try again later.");
      setError(errorMessage);
      alert(errorMessage);
      return false; // Login is NOT allowed
    }

    // All other cases (non-mobile devices OR mobile devices within 10 AM - 1 PM) are allowed to proceed.
    return true; // Login is allowed
  };
  // --- END IMPORTANT CHANGE ---

  // --- IMPORTANT CHANGE HERE: Updated shouldSendOtp() ---
  // This function determines if an OTP is needed *after* login is allowed.
  const shouldSendOtp = () => {
    const currentBrowser = getBrowserInfo();
    // OTP is required ONLY for Chrome.
    // This will apply to both desktop Chrome and mobile Chrome (if within 10-1PM)
    return currentBrowser === "Chrome" || currentBrowser === "Chrome (iOS)";
  };
  // --- END IMPORTANT CHANGE ---

  const fetchIPAddress = async () => {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      return response.data.ip;
    } catch (error) {
      console.error("Error fetching IP address:", error);
      return "Unknown";
    }
  };

  const gatherLoginMetadata = async () => {
    const ip = await fetchIPAddress();
    return {
      ip: ip,
      browser: getBrowserInfo(),
      os: getOSInfo(),
      device: getDeviceInfo(),
    };
  };

  const sendLoginMetadata = async (email, metadata) => {
    try {
      const response = await axios.post(
        "https://twiller-twitterclone-2-q41v.onrender.com/store-login-metadata",
        {
          email: email,
          metadata: metadata,
        }
      );
      console.log("Login metadata stored successfully:", response.data);
    } catch (error) {
      console.error("Error storing login metadata:", error.message || error);
    }
  };

  // Function to send OTP
  const handleSendOtp = async (emailToSend) => {
    if (!shouldSendOtp()) {
      console.warn("Attempted to send OTP when not allowed by browser type.");
      setShowOtpPopup(false);
      return;
    }
    // Redundant check, but good for safety
    if (!isLoginAllowed()) {
      setShowOtpPopup(false);
      return;
    }

    const targetEmail = emailToSend;
    if (!targetEmail || !targetEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post("https://twiller-twitterclone-2-q41v.onrender.com/send-chrome-otp", { email: targetEmail });
      alert(response.data.message);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(error.response?.data?.error || "Failed to send OTP. Please try again.");
    }
  };

  // Function to verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!shouldSendOtp()) {
      setError("OTP verification is not enabled for this browser.");
      setShowOtpPopup(false);
      return;
    }
    // Redundant check, but good for safety
    if (!isLoginAllowed()) {
      setShowOtpPopup(false);
      return;
    }

    const targetEmail = googleEmail || email;
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    try {
      const response = await axios.post("https://twiller-twitterclone-2-q41v.onrender.com/verify-chrome-otp", { email: targetEmail, otp });

      if (response.data.success) {
        alert("OTP verified successfully. Redirecting...");
        navigate("/");
        const metadata = await gatherLoginMetadata();
        await sendLoginMetadata(targetEmail, metadata);
        setShowOtpPopup(false);
      } else {
        setError(response.data.error || "Failed to verify OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError(error.response?.data?.error || "Failed to verify OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Always check general login allowance first (mobile time restriction)
    if (!isLoginAllowed()) {
      setShowOtpPopup(false); // Ensure OTP popup is hidden if login is not allowed
      return; // Stop execution if login is not allowed
    }

    try {
      await logIn(email, password); // Attempt Firebase login

      // 2. Based on browser, determine if OTP is needed
      if (shouldSendOtp()) {
        await handleSendOtp(email);
        setShowOtpPopup(true); // Show OTP popup only if sending OTP
      } else {
        // For non-Chrome browsers (Edge, Firefox, Safari) or if OTP not required
        setShowOtpPopup(false); // Ensure OTP popup is hidden if not needed
        navigate("/");
        const metadata = await gatherLoginMetadata();
        await sendLoginMetadata(email, metadata);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to log in. Please check your credentials.");
      window.alert(error.message); // Provide a user-friendly alert for login errors
      setShowOtpPopup(false); // Also hide popup on login error
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();

    // 1. Always check general login allowance first (mobile time restriction)
    if (!isLoginAllowed()) {
      setShowOtpPopup(false); // Ensure OTP popup is hidden if login is not allowed
      return; // Stop execution if login is not allowed
    }

    try {
      const userCredential = await googleSignin();
      const userEmail = userCredential?.user?.email;

      if (!userEmail) {
        setError("Unable to retrieve email from Google Sign-In.");
        setShowOtpPopup(false);
        return;
      }

      // 2. Based on browser, determine if OTP is needed
      if (shouldSendOtp()) {
        setGoogleEmail(userEmail);
        try {
          await handleSendOtp(userEmail);
          setShowOtpPopup(true);
        } catch (error) {
          console.error("Error during OTP sending:", error);
          setError("Failed to send OTP. Please try again.");
          setShowOtpPopup(false);
        }
      } else {
        // For non-Chrome browsers or if OTP not required
        setShowOtpPopup(false);
        navigate("/");
        const metadata = await gatherLoginMetadata();
        await sendLoginMetadata(userEmail, metadata);
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      setError(error.message || "Failed to sign in with Google.");
      setShowOtpPopup(false);
    }
  };

 

  return (
    <>
      <div className="login-container">
        <div className="image-container">
          <img src={twitterimg} className="image" alt="twitterimg" />
        </div>
        <div className="form-container">
          <div className="form-box">
            <TwitterIcon style={{ color: "skyblue" }} />
            <h2 className="heading">{t("Happening Now")}</h2>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                className="email"
                placeholder={t("Email address")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Password Input */}
              <input
                type="password"
                className="password"
                placeholder={t("Password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="btn-login">
                <button type="submit" className="btn">
                  {t("Log In")}
                </button>
              </div>
            </form>

            {/* OTP Popup */}
            {showOtpPopup && (
              <div className="otp-popup">
                <div className="popup-content">
                  <h3>{t('Verification')}</h3>

                  <input
                    type="text"
                    className="otp-input"
                    placeholder={t("Enter OTP")}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <div className="popup-buttons">
                    <button onClick={handleVerifyOtp}>{t('Verify OTP')}</button>
                    <button onClick={() => setShowOtpPopup(false)}>{t('Cancel')}</button>
                  </div>
                </div>
              </div>
            )}
            <hr />
            <div>
              <GoogleButton className="g-btn" type="light" onClick={handleGoogleSignIn} />
              <Link
                to="/resetpass"
                style={{
                  textDecoration: "none",
                  color: "var(--twitter-color)",
                  fontWeight: "600",
                  marginLeft: "5px",
                }}
              >
                {t("Forgot Password?")}
              </Link>
            </div>
          </div>
          <div>
            {t("Don't have an account?")}
            <Link
              to="/signup"
              style={{
                textDecoration: "none",
                color: "var(--twitter-color)",
                fontWeight: "600",
                marginLeft: "5px",
              }}
            >
              {t("Sign Up")}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;