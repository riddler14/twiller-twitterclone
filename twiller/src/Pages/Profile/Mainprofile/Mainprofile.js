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

  useEffect(() => {
    fetch(
      `https://twiller-twitterclone-ewhk.onrender.com/userpost?email=${user?.email}`
    )
      .then((res) => res.json())
      .then((data) => {
        setpost(data);
      });
  }, [user.email]);

  useEffect(() => {
    // Obtain user's geographical coordinates
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      // Convert coordinates to address using Google Maps Geocoding API
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          const address = data.results[0].formatted_address;
          setLocation(address);

          // Get weather conditions using a weather API
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
          )
            .then((response) => response.json())
            .then((weatherData) => {
              const weatherDescription = weatherData.weather[0].description;
              setWeather(weatherDescription);
            });
        });
    });
  }, []);
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
  // const data = [
  //     {
  //       _id: "1",
  //       name: "Jane Doe",
  //       username: "jane_doe",
  //       profilePhoto: "https://example.com/profiles/jane.jpg",
  //       post: "Exploring the new features in JavaScript! 🚀 #coding #JavaScript",
  //       photo: "https://example.com/posts/javascript.png",
  //     },
  //     {
  //       _id: "2",
  //       name: "John Smith",
  //       username: "johnsmith",
  //       profilePhoto: "https://example.com/profiles/john.jpg",
  //       post: "Just finished a great workout session! 💪 #fitness #health",
  //       photo: "https://example.com/posts/workout.png",
  //     },
  //     {
  //       _id: "3",
  //       name: "Alice Johnson",
  //       username: "alicejohnson",
  //       profilePhoto: "https://example.com/profiles/alice.jpg",
  //       post: "Loving the new features in CSS! #webdevelopment #design",
  //       photo: "https://example.com/posts/css.png",
  //     },
  //   ];
  return (
    <div>
      <ArrowBackIcon className="arrow-icon" onClick={() => navigate("/")} />
      <h4 className="heading-4">{username}</h4>
      <div className="mainprofile">
        <div className="profile-bio">
          {
            <div>
              <div className="coverImageContainer">
                <img
                  src={
                    loggedinuser[0]?.coverimage
                      ? loggedinuser[0].coverimage
                      : user && user.photoURL
                    //: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
                    // loggedinuser[0]?.coverimage
                    //   ? loggedinuser[0].coverimage
                    //   : user && user.photoURL
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
                      loggedinuser[0]?.profileImage
                        ? loggedinuser[0].profileImage
                        : user && user.photoURL
                      //: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
                      //   loggedinuser[0]?.profileImage
                      //     ? loggedinuser[0].profileImage
                      //     : user && user.photoURL
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
                  
                    <p className="suvInfo">
                     
                      <MyLocationIcon /> 
                      Location: {location} | Weather: {weather}
                    </p>
                    {loggedinuser[0]?.website ? (
                      <p className="subInfo link">
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
              {post.map((p) => (
                <Post p={p} />
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default Mainprofile;
