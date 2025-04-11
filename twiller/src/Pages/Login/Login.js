import React, { useState } from "react";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { useUserAuth } from "../../context/UserAuthContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import axios from "axios";

const Login = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false); // Controls the OTP popup visibility
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { googleSignin, logIn } = useUserAuth();
  const auth = getAuth();

  const userAgent = navigator.userAgent;
  const isMobile = /Mobi|Android/i.test(userAgent); // Check if the device is mobile
  const isChrome = userAgent.includes("Chrome") && !userAgent.includes("Edg"); // Check for Chrome
  const isEdge = userAgent.includes("Edg"); // Check for Edge

  // Function to send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      const response = await axios.post("https://twiller-twitterclone-2-q41v.onrender.com/send-chrome-otp", { email });
      alert(response.data.message); // Notify the user that the OTP has been sent
      setIsOtpSent(true); // Show OTP input field
    } catch (error) {
      setError(error.response?.data?.error || "Failed to send OTP");
    }
  };

  // Function to verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    try {
      const response = await axios.post("https://twiller-twitterclone-2-q41v.onrender.com/verify-chrome-otp", { email, otp });
      const firebaseToken = response.data.firebaseToken;

      // Authenticate the user using the Firebase custom token
      const userCredential = await signInWithCustomToken(auth, firebaseToken);
      console.log("User logged in:", userCredential.user);
      navigate("/"); // Redirect to the home page after successful login
    } catch (error) {
      setError(error.response?.data?.error || "Failed to verify OTP");
    }
  };

  // Handle login logic based on device and browser
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Get current time
    const now = new Date();
    const currentHour = now.getHours();

    if (isMobile) {
      // Restrict login to 7 PM to 12 PM for mobile devices
      if (currentHour < 19 || currentHour >= 24) {
        setError("Login is only allowed between 7 PM and 12 PM on mobile devices.");
        return;
      }
    }

    if (isChrome) {
      // Send OTP to Chrome users
      try {
        await handleSendOtp(e); // Call the handleSendOtp function here
        setShowOtpPopup(true); // Show the OTP popup
      } catch (error) {
        setError(error.message || "Failed to send OTP.");
      }
    } else if (isEdge) {
      // Direct login for Edge users
      try {
        await logIn(email, password);
        navigate("/");
      } catch (error) {
        setError(error.message);
        window.alert(error.message);
      }
    } else {
      // Default login for other browsers
      try {
        await logIn(email, password);
        navigate("/");
      } catch (error) {
        setError(error.message);
        window.alert(error.message);
      }
    }
  };


  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      await googleSignin();
      navigate("/");
    } catch (error) {
      console.log(error.message);
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
              {!isOtpSent && (
                <input
                  type="password"
                  className="password"
                  placeholder={t("Password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}

             

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
                  <h3>{t('Chrome Verification')}</h3>
                  
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