import React, { useState, useEffect } from "react";
import Post from "../Posts/posts";
import { useNavigate } from "react-router-dom";
import "./Mainprofile.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import LockResetIcon from "@mui/icons-material/LockReset";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddLinkIcon from "@mui/icons-material/AddLink";
import Editprofile from "../Editprofile/Editprofile";
import axios from "axios";
import useLoggedinuser from "../../../hooks/useLoggedinuser";


const Mainprofile = ({ user }) => {
  const navigate = useNavigate();
  const [isloading, setisloading] = useState(false);
  //const loggedinuser = []
  const [loggedinuser] = useLoggedinuser();
  const username = user?.email?.split("@")[0];
  const [post, setpost] = useState([]);
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editor, setEditor] = useState(null);
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
  const [top, setTop] = useState("shortHairShortFlat");
  const [accessories, setAccessories] = useState("prescription02");
  const [hairColor, setHairColor] = useState("brown");
  const [facialHair, setFacialHair] = useState("none");
  const [clothing, setClothing] = useState("blazerSweater");
  const [skinColor, setSkinColor] = useState("light");
  const [eyes, setEyes] = useState("default");
  const [eyebrow, setEyebrow] = useState("default");
  const [mouth, setMouth] = useState("default");
  const [background, setBackground] = useState("blue");

  const [isPopupVisible, setIsPopupVisible] = useState(false);
 


  useEffect(() => {
    fetch(
      `https://twiller-twitterclone-ewhk.onrender.com/userpost?email=${user?.email}`
    )
      .then((res) => res.json())
      .then((data) => {
        setpost(data);
      });
  }, [user.email]);

  
  
  
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
            `https://twiller-twitterclone-ewhk.onrender.com/userupdate/${user?.email}`,
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
            `https://twiller-twitterclone-ewhk.onrender.com/userupdate/${user?.email}`,
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

  

  



  const generateAvatarUrl = (
    seed,
    top,
    accessories,
    hairColor,
    facialHair,
    clothing,
    skinColor,
    eyes,
    eyebrow,
    mouth,
    background
  ) => {
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${username},top=${top},accessories=${accessories},hairColor=${hairColor},facialHair=${facialHair},clothing=${clothing},skinColor=${skinColor},eyes=${eyes},eyebrow=${eyebrow},mouth=${mouth},backgroundColor=${background}`;
  };

  const handleChooseAvatar = () => {
    const url = generateAvatarUrl(top, accessories, hairColor, facialHair, clothing, skinColor, eyes, eyebrow, mouth, background);
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
      await fetch(`https://twiller-twitterclone-ewhk.onrender.com/userupdate/${user?.email}`, {
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
                    Choose Avatar
                  </button>
                </div>
              </div>
              <div className="userInfo">
                <div>
                  <h3 className="heading-3">
                    {loggedinuser[0]?.name
                      ? loggedinuser[0].name
                      : user && user.displayname}
                  </h3>
                  <p className="usernameSection">@{username}</p>
                </div>
                <Editprofile user={user} loggedinuser={loggedinuser} />
              </div>
              <div className="infoContainer">
                {loggedinuser[0]?.bio ? <p>{loggedinuser[0].bio}</p> : ""}
                <div className="locationAndLink">
                  <button
                    onClick={fetchLocationAndWeather}
                    className="getLocationButton"
                  >
                    Get Location & Weather
                  </button>
                  <br />
                  <br />
                  <p className="suvInfo">
                    <MyLocationIcon />

                    <strong>
                      {loadingLocation
                        ? "Loading location ..."
                        : ` Location: ${location}`}
                    </strong>
                    <br />
                    <strong>
                      {loadingLocation
                        ? "Loading  Weather..."
                        : ` Weather: ${weather}`}
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
              </div>
              <h4 className="tweetsText">Tweets</h4>
              <hr />
            </div>
           {/* Customization Popup */}
           {isPopupVisible && (
    <div className="avatarCustomizationPopup">
      <h4>Customize Avatar</h4>
      <div className="avatar-preview">
            <img src={avatarUrl} alt="Customized Avatar" />
          </div>
      <div className="customizationButtons">
      

         <button
            onClick={() => {
              const newTop = top === "shortHairShortFlat" ? "longHairBigHair" : "shortHairShortFlat";
              setTop(newTop);
              setAvatarUrl(generateAvatarUrl( newTop, accessories, hairColor, facialHair, clothing, skinColor, eyes, eyebrow, mouth, background));
            }}
          >
            Toggle Top ({top})
          </button>
      <button
          onClick={() => {
            const newAccessories = accessories === "prescription02" ? "round" : "prescription02";
            setAccessories(newAccessories);
            setAvatarUrl(
              generateAvatarUrl(
              
                top,
                newAccessories,
                hairColor,
                facialHair,
                clothing,
                skinColor,
                eyes,
                eyebrow,
                mouth,
                background
              )
            );
          }}
        >
          Toggle Accessories ({accessories})
        </button>

        {/* Toggle Hair Color */}
        <button
          onClick={() => {
            const newHairColor = hairColor === "brown" ? "blonde" : "brown";
            setHairColor(newHairColor);
            setAvatarUrl(
              generateAvatarUrl(
            
                top,
                accessories,
                newHairColor,
                facialHair,
                clothing,
                skinColor,
                eyes,
                eyebrow,
                mouth,
                background
              )
            );
          }}
        >
          Toggle Hair Color ({hairColor})
        </button>

        {/* Toggle Facial Hair */}
        <button
          onClick={() => {
            const newFacialHair = facialHair === "none" ? "beardLight" : "none";
            setFacialHair(newFacialHair);
            setAvatarUrl(
              generateAvatarUrl(
               
                top,
                accessories,
                hairColor,
                newFacialHair,
                clothing,
                skinColor,
                eyes,
                eyebrow,
                mouth,
                background
              )
            );
          }}
        >
          Toggle Facial Hair ({facialHair})
        </button>

        {/* Toggle Clothing */}
        <button
          onClick={() => {
            const newClothing = clothing === "blazerSweater" ? "hoodie" : "blazerSweater";
            setClothing(newClothing);
            setAvatarUrl(
              generateAvatarUrl(
          
                top,
                accessories,
                hairColor,
                facialHair,
                newClothing,
                skinColor,
                eyes,
                eyebrow,
                mouth,
                background
              )
            );
          }}
        >
          Toggle Clothing ({clothing})
        </button>

        {/* Toggle Skin Color */}
        <button
          onClick={() => {
            const newSkinColor = skinColor === "light" ? "dark" : "light";
            setSkinColor(newSkinColor);
            setAvatarUrl(
              generateAvatarUrl(
            
                top,
                accessories,
                hairColor,
                facialHair,
                clothing,
                newSkinColor,
                eyes,
                eyebrow,
                mouth,
                background
              )
            );
          }}
        >
          Toggle Skin Color ({skinColor})
        </button>

        {/* Toggle Eyes */}
        <button
          onClick={() => {
            const newEyes = eyes === "default" ? "happy" : "default";
            setEyes(newEyes);
            setAvatarUrl(
              generateAvatarUrl(
           
                top,
                accessories,
                hairColor,
                facialHair,
                clothing,
                skinColor,
                newEyes,
                eyebrow,
                mouth,
                background
              )
            );
          }}
        >
          Toggle Eyes ({eyes})
        </button>

        {/* Toggle Eyebrow */}
        <button
          onClick={() => {
            const newEyebrow = eyebrow === "default" ? "angry" : "default";
            setEyebrow(newEyebrow);
            setAvatarUrl(
              generateAvatarUrl(
        
                top,
                accessories,
                hairColor,
                facialHair,
                clothing,
                skinColor,
                eyes,
                newEyebrow,
                mouth,
                background
              )
            );
          }}
        >
          Toggle Eyebrow ({eyebrow})
        </button>

        {/* Toggle Mouth */}
        <button
          onClick={() => {
            const newMouth = mouth === "default" ? "smile" : "default";
            setMouth(newMouth);
            setAvatarUrl(
              generateAvatarUrl(
           
                top,
                accessories,
                hairColor,
                facialHair,
                clothing,
                skinColor,
                eyes,
                eyebrow,
                newMouth,
                background
              )
            );
          }}
        >
          Toggle Mouth ({mouth})
        </button>

        {/* Toggle Background */}
        <button
          onClick={() => {
            const newBackground = background === "blue" ? "green" : "blue";
            setBackground(newBackground);
            setAvatarUrl(
              generateAvatarUrl(
                
                top,
                accessories,
                hairColor,
                facialHair,
                clothing,
                skinColor,
                eyes,
                eyebrow,
                mouth,
                newBackground
              )
            );
          }}
        >
          Toggle Background ({background})
        </button>
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
