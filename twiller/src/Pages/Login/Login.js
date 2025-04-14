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
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false); // Controls the OTP popup visibility
  const [error, setError] = useState("");
  const [googleEmail, setGoogleEmail] = useState(""); // Email retrieved from Google Sign-In
  const navigate = useNavigate();
  const { googleSignin, logIn } = useUserAuth();

  const userAgent = navigator.userAgent;
  const isMobile = /Mobi|Android/i.test(userAgent); // Check if the device is mobile
  const isChrome = userAgent.includes("Chrome") && !userAgent.includes("Edg"); // Check for Chrome
  const isEdge = userAgent.includes("Edg"); // Check for Edge

  const fetchIPAddress = async () => {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      return response.data.ip;
    } catch (error) {
      console.error("Error fetching IP address:", error);
      return "Unknown";
    }
  };
  
  const getBrowserInfo = () => {
    if (isChrome) return "Chrome";
    if (isEdge) return "Edge";
    return "Other";
  };
  
  const getOSInfo = () => {
    if (/Windows/i.test(userAgent)) return "Windows";
    if (/Macintosh/i.test(userAgent)) return "Mac";
    if (/Linux/i.test(userAgent)) return "Linux";
    return "Other";
  };
  
  const getDeviceInfo = () => {
    return isMobile ? "Mobile" : "Desktop";
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
  const handleSendOtp = async () => {
    const targetEmail = googleEmail || email; // Use Google email or regular email
  
    console.log("Target email for OTP:", targetEmail); // Debugging log
  
    if (!targetEmail || !targetEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
  
    try {
      const response = await axios.post("https://twiller-twitterclone-2-q41v.onrender.com/send-chrome-otp", { email: targetEmail });
  
      console.log("OTP sent successfully:", response.data); // Debugging log
      alert(response.data.message); // Notify the user that the OTP has been sent
      setIsOtpSent(true); // Show OTP input field
    } catch (error) {
      console.error("Error sending OTP:", error); // Log the full error
      setError(error.response?.data?.error || "Failed to send OTP. Please try again.");
    }
  };

  // Function to verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const targetEmail = googleEmail || email; // Use Google email or regular email
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    try {
      const response = await axios.post("https://twiller-twitterclone-2-q41v.onrender.com/verify-chrome-otp", { email: targetEmail, otp });

      console.log("OTP verification response:", response.data);

      if (response.data.success) {
        alert("OTP verified successfully. Logging in...");

        if (googleEmail) {
          // Proceed with Google Sign-In
          try {
            await googleSignin();
            navigate("/");
            const metadata = await gatherLoginMetadata();
            await sendLoginMetadata(googleEmail, metadata);
          } catch (error) {
            setError(error.message);
            window.alert(error.message);
          }
        } else {
          // Proceed with regular email/password login
          if (!email || !password) {
            setError("Email and password are required.");
            return;
          }
          await logIn(email, password);
          navigate("/");
          const metadata = await gatherLoginMetadata();
        await sendLoginMetadata(email, metadata);
        }
      } else {
        setError(response.data.error || "Failed to verify OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError(error.response?.data?.error || "Failed to verify OTP");
    }
  };

  // Handle login logic based on device and browser
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const now = new Date();
    const currentHour = now.getHours();

    if (isMobile) {
      if (currentHour < 20 || currentHour >= 24) {
        setError("Login is only allowed between 8 PM and 12 AM on mobile devices.");
        return;
      }
    }

    if (isChrome) {
      // Send OTP to Chrome users
      try {
        await handleSendOtp(); // Call the handleSendOtp function here
        setShowOtpPopup(true); // Show the OTP popup
      } catch (error) {
        setError(error.message || "Failed to send OTP.");
      }
    } else if (isEdge) {
      // Direct login for Edge users
      try {
        await logIn(email, password);
        navigate("/");

        const metadata = await gatherLoginMetadata();
      await sendLoginMetadata(email, metadata);
      } catch (error) {
        setError(error.message);
        window.alert(error.message);
      }
    } else {
      // Default login for other browsers
      try {
        await logIn(email, password);
        navigate("/");
        const metadata = await gatherLoginMetadata();
      await sendLoginMetadata(email, metadata);
      } catch (error) {
        setError(error.message);
        window.alert(error.message);
      }
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      // Trigger Google Sign-In
      const user = await googleSignin();
      const userEmail = user?.user?.email;
  
      if (!userEmail) {
        setError("Unable to retrieve email from Google Sign-In.");
        return;
      }
  
      console.log("Step 1: Google Sign-In completed. Email:", userEmail);
  
      // Check if the browser is Chrome
      if (isChrome) {
        // Set the Google email in the state
        setGoogleEmail(userEmail);
  
        // Ensure the email is set before proceeding
        await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for state update
  
        // Send OTP to the user's email
        try {
          await handleSendOtp(); // Send OTP for Google email
          console.log("Step 2: OTP sent successfully.");
          setShowOtpPopup(true); // Show the OTP popup only after OTP is sent
        } catch (error) {
          console.error("Error during OTP sending:", error);
          setError("Failed to send OTP. Please try again.");
        }
      } else {
        // For non-Chrome browsers (e.g., Edge) or mobile devices, log in directly using googleSignin()
        try {
          await googleSignin(); // Complete the Google Sign-In process
          navigate("/");
  
          // Gather and send login metadata
          const metadata = await gatherLoginMetadata();
          await sendLoginMetadata(userEmail, metadata);
        } catch (error) {
          console.error("Error during direct Google Sign-In:", error);
          setError(error.message || "Failed to log in with Google.");
        }
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      setError(error.message || "Failed to sign in with Google.");
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