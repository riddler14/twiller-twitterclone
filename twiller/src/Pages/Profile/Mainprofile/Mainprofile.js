import React, { useState, useEffect, useMemo } from "react";
import Post from "../Posts/Post";
import { useNavigate } from "react-router-dom";
import "./Mainprofile.css";
import FollowSection from "./FollowSection";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import LockResetIcon from "@mui/icons-material/LockReset";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddLinkIcon from "@mui/icons-material/AddLink";
import Editprofile from "../Editprofile/Editprofile";
import axios from "axios";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
// import { listenForNotifications } from "./socket";
import {useTranslation} from "react-i18next";
import VerifiedUserIcon from "@mui/icons-material/Verified";

const Mainprofile = ({ user }) => {
  const navigate = useNavigate();
  const [isloading, setisloading] = useState(false);
  //const loggedinuser = []
  const [loggedinuser] = useLoggedinuser();
  const username = loggedinuser[0]?.username || user?.email?.split("@")[0];
  const [post, setpost] = useState([]);
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.notificationsEnabled || false);
   // State to toggle EditProfile visibility
  const {t}=useTranslation();
  const [avatarUrl, setAvatarUrl] = useState("");
    const [subscriptionPlan, setSubscriptionPlan] = useState("free");

  const [showLoginHistoryPopup, setShowLoginHistoryPopup] = useState(false); // Controls the login history popup visibility
const [loginHistory, setLoginHistory] = useState([]); // Stores the login history data
  // useEffect(() => {
  //   if (user?.email) {
  //     fetch(
  //       `https://twiller-twitterclone-ewhk.onrender.com/userprofile?email=${user.email}`
  //     )
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.profileImage) {
  //           setAvatarUrl(data.profileImage);
  //         }
  //       })
  //       .catch((error) =>
  //         console.error("Error fetching profile image:", error)
  //       );
  //   }
  // }, [user.email]);
  // const [seed,setSeed]=useState("Aneka");
  const predefinedSeeds = ["Valentina", "Christian", "Aneka", "Felix"];
  const [currentSeed, setCurrentSeed] = useState(predefinedSeeds[0]);

  const seedParameters = useMemo(()=>({
    Valentina: {
      top: ["bigHair","bob","bun","curly","curvy","dreads","dreads01","dreads02","frida","frizzle","fro","longButNotTooLong","shaggy"],
      accessories: ["prescription02", "round","sunglasses","wayfarers","kurt","eyepatch","prescription01"],
      hairColor: ["2c1b18","4a312c","724133","a55728","b58143","c93305","d6b370","e8e1e1","ecdcbf","f59797"],
      clothing: ["blazerAndSweater", "hoodie","blazerAndShirt","collarAndSweater","graphicShirt","shirtCrewNeck"],
      skinColor: ["614335","ae5d29","d08b5b","edb98a","f8d25c","fd9841","ffdbb4"],
      backgroundColor: ["b6e3f4","c0aede","d1d4f9","ffd5dc","ffdfbf"],
    },
    Christian: {
      top: ["bigHair","bob","bun","curly","curvy","dreads","dreads01","dreads02","frida","frizzle","fro","longButNotTooLong","shaggy"],
      accessories: ["prescription02", "round","sunglasses","wayfarers","kurt","eyepatch","prescription01"],
      hairColor: ["2c1b18","4a312c","724133","a55728","b58143","c93305","d6b370","e8e1e1","ecdcbf","f59797"],
      clothing: ["blazerAndSweater", "hoodie","blazerAndShirt","collarAndSweater","graphicShirt","shirtCrewNeck"],
      skinColor: ["614335","ae5d29","d08b5b","edb98a","f8d25c","fd9841","ffdbb4"],
      backgroundColor: ["b6e3f4","c0aede","d1d4f9","ffd5dc","ffdfbf"],
    },
    Aneka: {
      top: ["bigHair","bob","bun","curly","curvy","dreads","dreads01","dreads02","frida","frizzle","fro","longButNotTooLong","shaggy"],
      accessories: ["prescription02", "round","sunglasses","wayfarers","kurt","eyepatch","prescription01"],
      hairColor: ["2c1b18","4a312c","724133","a55728","b58143","c93305","d6b370","e8e1e1","ecdcbf","f59797"],
      clothing: ["blazerAndSweater", "hoodie","blazerAndShirt","collarAndSweater","graphicShirt","shirtCrewNeck"],
      skinColor: ["614335","ae5d29","d08b5b","edb98a","f8d25c","fd9841","ffdbb4"],
      backgroundColor: ["b6e3f4","c0aede","d1d4f9","ffd5dc","ffdfbf"],
    },
    Felix: {
      top: ["bigHair","bob","bun","curly","curvy","dreads","dreads01","dreads02","frida","frizzle","fro","longButNotTooLong","shaggy"],
      accessories: ["prescription02", "round","sunglasses","wayfarers","kurt","eyepatch","prescription01"],
      hairColor: ["2c1b18","4a312c","724133","a55728","b58143","c93305","d6b370","e8e1e1","ecdcbf","f59797"],
      clothing: ["blazerAndSweater", "hoodie","blazerAndShirt","collarAndSweater","graphicShirt","shirtCrewNeck"],
      skinColor: ["614335","ae5d29","d08b5b","edb98a","f8d25c","fd9841","ffdbb4"],
      backgroundColor: ["b6e3f4","c0aede","d1d4f9","ffd5dc","ffdfbf"],
    },
  }),[]);

  const [top, setTop] = useState(seedParameters[currentSeed].top[0]);
  const [accessories, setAccessories] = useState(seedParameters[currentSeed].accessories[0]);
  const [hairColor, setHairColor] = useState(seedParameters[currentSeed].hairColor[0]);
  const [clothing, setClothing] = useState(seedParameters[currentSeed].clothing[0]);
  const [skinColor, setSkinColor] = useState(seedParameters[currentSeed].skinColor[0]);
  const [backgroundColor, setBackground] = useState(seedParameters[currentSeed].backgroundColor[0]);

  const [topOptions, setTopOptions] = useState(seedParameters[currentSeed].top);
  const [accessoriesOptions, setAccessoriesOptions] = useState(seedParameters[currentSeed].accessories);
  const [hairColorOptions, setHairColorOptions] = useState(seedParameters[currentSeed].hairColor);
  const [clothingOptions, setClothingOptions] = useState(seedParameters[currentSeed].clothing);
  const [skinColorOptions, setSkinColorOptions] = useState(seedParameters[currentSeed].skinColor);
  const [backgroundOptions, setBackgroundOptions] = useState(seedParameters[currentSeed].backgroundColor);


  const [isPopupVisible, setIsPopupVisible] = useState(false);
 

  // useEffect(() => {
  //   listenForNotifications(user.email, (notification) => {
  //     console.log("Received notification:", notification);
  //     // Optionally update the UI with the notification
  //   });
  // }, [user.email]);
  useEffect(() => {
    fetch(
      `https://twiller-twitterclone-2-q41v.onrender.com/userpost?email=${user?.email}`
    )
      .then((res) => res.json())
      .then((data) => {
        setpost(data);
      });
  }, [user.email]);

  useEffect(() => {
    const fetchNotificationPreference = async () => {
      try {
        const response = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/get-notification-preference/${user?.email}`
        );
        if (response.data.success) {
          setNotificationsEnabled(response.data.notificationsEnabled);
        }
      } catch (error) {
        console.error("Error fetching notification preference:", error);
      }
    };

    if (user?.email) {
      fetchNotificationPreference();
    }
  }, [user?.email]);

  const fetchLoginHistory = async () => {
    try {
      const response = await axios.get("https://twiller-twitterclone-2-q41v.onrender.com/login-history", {
        params: { email: loggedinuser[0]?.email },
      });
      setLoginHistory(response.data.loginHistory || []);
      setShowLoginHistoryPopup(true); // Show the login history popup
    } catch (error) {
      console.error("Error fetching login history:", error.message || error);
      alert("Failed to fetch login history.");
    }
  };
  const toggleNotificationPreference = async () => {
    try {
      const newPreference = !notificationsEnabled; // Toggle the current state
  
      // Ensure only valid data is sent
      const userEmail = user?.email; // Extract email explicitly
      if (!userEmail) {
        console.error("User email is missing.");
        alert("An error occurred: User email is missing.");
        return;
      }
  
      const response = await axios.patch(`https://twiller-twitterclone-2-q41v.onrender.com/update-notification-preference/${userEmail}`, {
        notificationsEnabled: newPreference,
      });
  
      if (response.data.success) {
        setNotificationsEnabled(newPreference); // Update local state
        alert(`Notifications ${newPreference ? "enabled" : "disabled"}.`);
      } else {
        alert("Failed to update notification preference.");
      }
    } catch (error) {
      console.error("Error updating notification preference:", error);
      alert("An error occurred while updating notification preference.");
    }
  };
  
  
  const fetchLocationAndWeather = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.results && data.results.length > 0) {
                const addressComponents = data.results[0].address_components;
                const city = addressComponents.find((component) =>
                  component.types.includes("locality")
                )?.long_name;
                const state = addressComponents.find((component) =>
                  component.types.includes("administrative_area_level_1")
                )?.long_name;
                const country = addressComponents.find((component) =>
                  component.types.includes("country")
                )?.long_name;
                const address = `${city}, ${state}, ${country}`;

                setLocation(address);

                fetch(
                  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
                )
                  .then((response) => response.json())
                  .then((weatherData) => {
                    if (weatherData.weather && weatherData.weather.length > 0) {
                      const weatherDescription =
                        weatherData.weather[0].description;
                      setWeather(weatherDescription);
                    } else {
                      console.error("No weather data found.");
                    }
                    setLoadingLocation(false);
                  })
                  .catch((error) => {
                    console.error("Error fetching weather data:", error);
                    setLoadingLocation(false);
                  });
              } else {
                console.error("No results found for the given coordinates.");
                setLocation("Location not found");
                setLoadingLocation(false);
              }
            })
            .catch((error) => {
              console.error("Error fetching geocoding data:", error);
              setLoadingLocation(false);
            });
        },
        (error) => {
          console.error("Error obtaining location:", error);
          setLoadingLocation(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleuploadcoverimage = (e) => {
    setisloading(true);
    const image = e.target.files[0];
    // console.log(image)
    const formData = new FormData();
    formData.set("image", image);
    axios
      .post(
        "https://api.imgbb.com/1/upload?key=131172eab64930e16173f6f8467ba9a6",
        formData
      )
      .then((res) => {
        const url = res.data.data.display_url;
        // console.log(res.data.data.display_url);
        const usercoverimage = {
          email: user?.email,
          coverimage: url,
        };
        setisloading(false);
        if (url) {
          fetch(
            `https://twiller-twitterclone-2-q41v.onrender.com/userupdate/${user?.email}`,
            {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify(usercoverimage),
            }
          )
            .then((res) => res.json())
            .then((data) => {
              console.log("done", data);
            });
        }
      })
      .catch((e) => {
        console.log(e);
        window.alert(e);
        setisloading(false);
      });
  };
  const handleuploadprofileimage = (e) => {
    setisloading(true);
    const image = e.target.files[0];
    // console.log(image)
    const formData = new FormData();
    formData.set("image", image);
    axios
      .post(
        "https://api.imgbb.com/1/upload?key=131172eab64930e16173f6f8467ba9a6",
        formData
      )
      .then((res) => {
        const url = res.data.data.display_url;
        // console.log(res.data.data.display_url);
        const userprofileimage = {
          email: user?.email,
          profileImage: url,
        };
        setisloading(false);
        if (url) {
          fetch(
            `https://twiller-twitterclone-2-q41v.onrender.com/userupdate/${user?.email}`,
            {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify(userprofileimage),
            }
          )
            .then((res) => res.json())
            .then((data) => {
              console.log("done", data);
            });
        }
      })
      .catch((e) => {
        console.log(e);
        window.alert(e);
        setisloading(false);
      });
  };

  

  



  useEffect(() => {
    setTopOptions(seedParameters[currentSeed].top);
    setAccessoriesOptions(seedParameters[currentSeed].accessories);
    setHairColorOptions(seedParameters[currentSeed].hairColor);
    setClothingOptions(seedParameters[currentSeed].clothing);
    setSkinColorOptions(seedParameters[currentSeed].skinColor);
    setBackgroundOptions(seedParameters[currentSeed].backgroundColor);
      
  },[currentSeed,seedParameters]);

  const generateAvatarUrl = () => {
    const params = [];
    if (seedParameters[currentSeed].top) params.push(`top=${top}`);
    if (seedParameters[currentSeed].accessories) params.push(`accessories=${accessories}`);
    if (seedParameters[currentSeed].hairColor) params.push(`hairColor=${hairColor}`);
    if (seedParameters[currentSeed].clothing) params.push(`clothing=${clothing}`);
    if (seedParameters[currentSeed].skinColor) params.push(`skinColor=${skinColor}`);
    if (seedParameters[currentSeed].backgroundColor) params.push(`backgroundColor=${backgroundColor}`);

    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentSeed},${params.join(",")}`;
  };

  const handleChooseAvatar = () => {
    const url = generateAvatarUrl();
    setAvatarUrl(url);
    setIsPopupVisible(true);
  };


  const handleAvatarUpload = async () => {
    setisloading(true);
    try {
      const response = await fetch(avatarUrl);
      const svgData = await response.text();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
      await new Promise((resolve) => (img.onload = resolve));
      canvas.width = 500;
      canvas.height = 500;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const file = new File([blob], "avatar.png", { type: "image/png" });
      const formData = new FormData();
      formData.append("image", file);
      const uploadResponse = await axios.post(
        "https://api.imgbb.com/1/upload?key=131172eab64930e16173f6f8467ba9a6",
        formData
      );
      const imgUrl = uploadResponse.data.data.display_url;
      const userProfileUpdate = {
        email: user?.email,
        profileImage: imgUrl,
      };
      await fetch(`https://twiller-twitterclone-2-q41v.onrender.com/userupdate/${user?.email}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userProfileUpdate),
      });
      console.log("Avatar successfully updated:", imgUrl);
      setAvatarUrl(imgUrl);
      setisloading(false);
      setIsPopupVisible(false);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      window.alert("Avatar upload failed.");
      setisloading(false);
    }
  };

  
  

  const handleCancelAvatar = () => {
    setIsPopupVisible(false); // Close the customization popup without saving
  };
   useEffect(() => {
    const fetchSubscriptionPlan = async () => {
      try {
        const response = await fetch(`https://twiller-twitterclone-2-q41v.onrender.com/subscription?email=${encodeURIComponent(user.email)}`);
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
  }, [user.email]);


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
        return null; // No icon for "free" plan
    }
  };

  return (
    <div>
      <ArrowBackIcon className="arrow-icon" onClick={() => navigate("/")} />
      <h4 className="heading-4">{username}</h4>
      <div className="mainprofile">
        <div className="profile-bio">
          <div>
            <div className="coverImageContainer">
              <img
                src={
                  loggedinuser[0]?.coverimage
                    ? loggedinuser[0].coverimage
                    : user && user.photoURL
                }
                alt=""
                className="coverImage"
              />
              <div className="hoverCoverImage">
                <div className="imageIcon_tweetButton">
                  <label htmlFor="image" className="imageIcon">
                    {isloading ? (
                      <LockResetIcon className="photoIcon photoIconDisabled" />
                    ) : (
                      <CenterFocusWeakIcon className="photoIcon" />
                    )}
                  </label>
                  <input
                    type="file"
                    id="image"
                    className="imageInput"
                    onChange={handleuploadcoverimage}
                  />
                </div>
              </div>
            </div>
            <div className="avatar-img">
              <div className="avatarContainer">
                <img
                  src={
                    avatarUrl || loggedinuser[0]?.profileImage || user?.photoURL
                  }
                  alt=""
                  className="avatar"
                />
                <div className="hoverAvatarImage">
                  <div className="imageIcon_tweetButton">
                    <label htmlFor="profileImage" className="imageIcon">
                      {isloading ? (
                        <LockResetIcon className="photoIcon photoIconDisabled" />
                      ) : (
                        <CenterFocusWeakIcon className="photoIcon" />
                      )}
                    </label>
                    <input
                      type="file"
                      id="profileImage"
                      className="imageInput"
                      onChange={handleuploadprofileimage}
                    />
                  </div>
                  <button
                    className="avatar-library-button"
                    onClick={handleChooseAvatar}
                  >
                    {t('Choose Avatar')}
                  </button>
                </div>
              </div>
              <div className="userInfo">
                <div>
                  <h3 className="heading-3">
                    {loggedinuser[0]?.name
                      ? loggedinuser[0].name
                      : user && user.displayname}
                      {getVerifiedIcon()}
                  </h3>
                  <p className="usernameSection">@{username}</p>
                </div>
                <button onClick={toggleNotificationPreference} className="notification-settings">
                {notificationsEnabled ? t("Disable Notifications") : t("Enable Notifications")}
              </button>
                 {/* Conditional Rendering of Edit Profile or Follow Button */}
         
            <Editprofile user={user} loggedinuser={loggedinuser} />
            <button onClick={fetchLoginHistory} className="login-history-button">
      {t('Login History')}
    </button>
              </div>
              {showLoginHistoryPopup && (
  <div className="login-history-popup">
    <div className="popup-content">
      <h3>{t('Login History')}</h3>
      {loginHistory.length > 0 ? (
        <ul>
          {loginHistory.map((entry, index) => (
            <li key={index}>
              <strong>{new Date(entry.timestamp).toLocaleString()}</strong>
              <br />
              IP: {entry.ip}, Browser: {entry.browser}, OS: {entry.os}, Device: {entry.device}
            </li>
          ))}
        </ul>
      ) : (
        <p>{t('No login history available.')}</p>
      )}
      <button onClick={() => setShowLoginHistoryPopup(false)}>{t('Close')}</button>
    </div>
  </div>
)}
              <div className="infoContainer">
                {loggedinuser[0]?.bio ? <p>{loggedinuser[0].bio}</p> : ""}
                <div className="locationAndLink">
                  <button
                    onClick={fetchLocationAndWeather}
                    className="getLocationButton"
                  >
                    {t('Get Location & Weather')}
                  </button>
                  <br />
                  <br />
                  <p className="suvInfo">
                    <MyLocationIcon />

                    <strong>
                      {loadingLocation
      ? t("loadingLocation") // Keep this translated if "Loading location..." is in your i18n
      : location // Check if location is available
      ? `Location: ${location}` // Hardcoded string + dynamic location
      : "Location not available" // Hardcoded fallback for no location
    }
                    </strong>
                    <br />
                    <strong>
                      {loadingLocation
      ? t("loadingLocation") // Keep this translated
      : weather // Check if weather is available
      ? `Weather: ${weather}` // Hardcoded string + dynamic weather
      : "Weather not available" // Hardcoded fallback for no weather
    }
                    </strong>
                  </p>
                  {loggedinuser[0]?.website ? (
                    <p className="suvInfo link">
                      <AddLinkIcon /> {loggedinuser[0].website}
                    </p>
                  ) : (
                    ""
                  )}
                </div>
                <FollowSection user={user}/>
              </div>
              <h4 className="tweetsText">Tweets</h4>
              <hr />
            </div>
           {/* Customization Popup */}
           {isPopupVisible && (
    <div className="avatarCustomizationPopup">
      <h4>{t('Customize Avatar')}</h4>
      <div className="avatar-preview">
            <img src={avatarUrl} alt="Customized Avatar" />
          </div>
      <div className="customizationButtons">
      

      <label>
          <b>Select Seed</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
          <select
            value={currentSeed}
            onChange={(e) => {
              const newSeed = e.target.value;
              setCurrentSeed(newSeed);
              setAvatarUrl(
                generateAvatarUrl(newSeed, top, accessories, hairColor,  clothing, skinColor, backgroundColor)
              );
            }}
          >
            {predefinedSeeds.map((seed) => (
              <option key={seed} value={seed}>
                {seed.charAt(0).toUpperCase() + seed.slice(1)}
              </option>
            ))}
          </select>
        </label>
            <br/>
        {/* Dropdown for Top */}
        {seedParameters[currentSeed].top && (
          <label>
            <b>Top</b>   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: 
            <select
              value={top}
              onChange={(e) => {
                const newTop = e.target.value;
                setTop(newTop);
                setAvatarUrl(
                  generateAvatarUrl(currentSeed, newTop, accessories, hairColor,  clothing, skinColor,  backgroundColor)
                );
              }}
            >
              {topOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
        )}
        <br/>
        {/* Dropdown for Accessories */}
        {seedParameters[currentSeed].accessories && (
          <label>
            <b>Accessories</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
            <select
              value={accessories}
              onChange={(e) => {
                const newAccessories = e.target.value;
                setAccessories(newAccessories);
                setAvatarUrl(
                  generateAvatarUrl(currentSeed, top, newAccessories, hairColor, clothing, skinColor,  backgroundColor)
                );
              }}
            >
              {accessoriesOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
        )}
        <br/>
         {seedParameters[currentSeed].hairColor && (
          <label>
            <b>Hair Color</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
            <select
              value={hairColor}
              onChange={(e) => {
                const newHariColor = e.target.value;
                setHairColor(newHariColor);
                setAvatarUrl(
                  generateAvatarUrl(currentSeed, top, accessories, newHariColor, clothing, skinColor,  backgroundColor)
                );
              }}
            >
              {hairColorOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
        )}
        <br/>
           {seedParameters[currentSeed].clothing && (
          <label>
            <b>Clothing</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
            <select
              value={clothing}
              onChange={(e) => {
                const newClothing = e.target.value;
                setClothing(newClothing);
                setAvatarUrl(
                  generateAvatarUrl(currentSeed, top, accessories, hairColor, newClothing, skinColor,  backgroundColor)
                );
              }}
            >
              {clothingOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
        )}<br/>
        {seedParameters[currentSeed].skinColor && (
          <label>
            <b>Skin Color</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
            <select
              value={skinColor}
              onChange={(e) => {
                const newSkinColor = e.target.value;
                setSkinColor(newSkinColor);
                setAvatarUrl(
                  generateAvatarUrl(currentSeed, top, accessories, hairColor, clothing, newSkinColor,  backgroundColor)
                );
              }}
            >
              {skinColorOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
        )}
        <br/>
         {seedParameters[currentSeed].backgroundColor && (
          <label>
            <b>Background Color:</b>
            <select
              value={backgroundColor}
              onChange={(e) => {
                const newBackground = e.target.value;
                setBackground(newBackground);
                setAvatarUrl(
                  generateAvatarUrl(currentSeed, top, accessories, hairColor, clothing, skinColor,  newBackground)
                );
              }}
            >
              {backgroundOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="popupButtons">
        <button onClick={handleAvatarUpload}>Save</button>
        <button onClick={handleCancelAvatar}>Cancel</button>
      </div>
    </div>
  )}

            {post.map((p) => (
              <Post p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mainprofile;
