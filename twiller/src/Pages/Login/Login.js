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
  // Function to send OTP
const handleSendOtp = async (emailToSend) => { // Accept an argument here
  const targetEmail = emailToSend; // Use the argument passed in

  console.log("Target email for OTP:", targetEmail); // Debugging log

  if (!targetEmail || !targetEmail.includes("@")) {
    setError("Please enter a valid email address.");
    return;
  }

  try {
    const response = await axios.post("https://twiller-twitterclone-2-q41v.onrender.com/send-chrome-otp", { email: targetEmail });

    console.log("OTP sent successfully:", response.data); // Debugging log
    alert(response.data.message); // Notify the user that the OTP has been sent
  } catch (error) {
    console.error("Error sending OTP:", error); // Log the full error
    setError(error.response?.data?.error || "Failed to send OTP. Please try again.");
  }
};

  // Function to verify OTP
  // Function to verify OTP
// Function to verify OTP
const handleVerifyOtp = async (e) => {
  e.preventDefault();
  const targetEmail = googleEmail || email; // This correctly gets the email
  if (!otp) {
    setError("Please enter the OTP.");
    return;
  }
  try {
    const response = await axios.post("https://twiller-twitterclone-2-q41v.onrender.com/verify-chrome-otp", { email: targetEmail, otp });

    console.log("OTP verification response:", response.data);

    if (response.data.success) {
      alert("OTP verified successfully. Redirecting..."); // Changed message slightly

      // Logic after successful OTP verification
      if (googleEmail) {
        // This path is for Google Sign-In, where googleSignin() would have initiated the session
        // It's still good to call it to finalize the Firebase session if it wasn't fully established.
        try {
          await googleSignin(); // Re-confirm Google sign-in to finalize session
          navigate("/");
          const metadata = await gatherLoginMetadata();
          await sendLoginMetadata(googleEmail, metadata);
        } catch (error) {
          setError(error.message || "Google Sign-In failed after OTP verification.");
          window.alert(error.message);
        }
      } else {
        // For regular email/password login, the `logIn` already happened in handleSubmit
        // So, now just navigate and store metadata.
        navigate("/");
        const metadata = await gatherLoginMetadata();
        await sendLoginMetadata(email, metadata); // Use 'email' for regular login metadata
      }
      setShowOtpPopup(false); // Close the OTP popup on success
    } else {
      setError(response.data.error || "Failed to verify OTP.");
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    setError(error.response?.data?.error || "Failed to verify OTP");
  }
};

  // Handle login logic based on device and browser
  // Handle login logic based on device and browser
// Handle login logic based on device and browser
const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); // Clear previous errors

  const now = new Date();
  const currentHour = now.getHours();

  if (isMobile) {
    if (currentHour < 20 || currentHour >= 24) {
      setError("Login is only allowed between 8 PM and 12 AM on mobile devices.");
      return;
    }
  }

  // --- STEP 1: Attempt initial login for ALL users ---
  try {
    // Attempt the Firebase login first
    await logIn(email, password); // This will throw an error if credentials are bad

    // If logIn is successful, proceed based on browser
    if (isChrome) {
      // --- STEP 2 (for Chrome): Send OTP after successful initial login ---
      // For Chrome users, even though they logged in, we now need OTP for 2FA-like security
      await handleSendOtp(email); // Pass the email to send OTP
      setShowOtpPopup(true); // Show the OTP popup
      // Do NOT navigate here yet; navigation happens AFTER OTP verification
    } else {
      // --- STEP 2 (for non-Chrome): Navigate directly ---
      navigate("/"); // Navigate home for non-Chrome browsers (Edge, others)
      const metadata = await gatherLoginMetadata();
      await sendLoginMetadata(email, metadata);
    }

  } catch (error) {
    // --- STEP 3: Handle login errors immediately ---
    console.error("Login error:", error);
    setError(error.message || "Failed to log in. Please check your credentials.");
    // Optionally alert the user directly for critical errors
    window.alert(error.message);
  }
};

  // Handle Google Sign-In
  // Handle Google Sign-In
const handleGoogleSignIn = async (e) => {
  e.preventDefault();
  try {
    const user = await googleSignin();
    const userEmail = user?.user?.email;

    if (!userEmail) {
      setError("Unable to retrieve email from Google Sign-In.");
      return;
    }

    console.log("Step 1: Google Sign-In completed. Email:", userEmail);

    if (isChrome) {
      setGoogleEmail(userEmail); // Still set this for `handleVerifyOtp` and other potential uses

      try {
        await handleSendOtp(userEmail); // <-- Pass userEmail directly here!
        console.log("Step 2: OTP sent successfully.");
        setShowOtpPopup(true);
      } catch (error) {
        console.error("Error during OTP sending:", error);
        setError("Failed to send OTP. Please try again.");
      }
    } else {
      // For non-Chrome browsers, proceed directly
      try {
        await googleSignin(); // This might be redundant if `user` already holds the signed-in user
        navigate("/");
        const metadata = await gatherLoginMetadata();
        await sendLoginMetadata(userEmail, metadata); // Use userEmail directly
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