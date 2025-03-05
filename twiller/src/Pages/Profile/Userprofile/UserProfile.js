import React, { useState, useEffect } from "react";
import Post from "../Posts/posts";
import { useParams, useNavigate } from "react-router-dom";
import "../Mainprofile/Mainprofile.css"; // Use the same CSS as Mainprofile or adjust as needed
import FollowButton from "../Mainprofile/FollowButton"; 
import FollowSection from "../Mainprofile/FollowSection";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import LockResetIcon from "@mui/icons-material/LockReset";

import axios from "axios";
import useLoggedinuser from "../../../hooks/useLoggedinuser";

const UserProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const {email} =useParams();// Extract username from URL
  const [loggedinuser] = useLoggedinuser();
  const [user, setUser] = useState(null); // Profile user data
  const [posts, setPosts] = useState([]); // Posts of the profile user
  const [isLoading, setIsLoading] = useState(true);
const [avatarUrl, setAvatarUrl] = useState("");
  // Fetch profile user data based on username
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `https://twiller-twitterclone-1-j9kj.onrender.com/userprofile?username=${email}`
        );
        if (response.data.user) {
          setUser(response.data.user); // Set user data
        } else {
          console.error("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [email]);

  // Fetch posts for the profile user
  useEffect(() => {
    if (user?.email) {
      fetch(`https://twiller-twitterclone-1-j9kj.onrender.com/userpost?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch((error) => console.error("Error fetching posts:", error));
    }
  }, [user?.email]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

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
                    {isLoading ? (
                      <LockResetIcon className="photoIcon photoIconDisabled" />
                    ) : (
                      <CenterFocusWeakIcon className="photoIcon" />
                    )}
                  </label>
                 
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
                      {isLoading ? (
                        <LockResetIcon className="photoIcon photoIconDisabled" />
                      ) : (
                        <CenterFocusWeakIcon className="photoIcon" />
                      )}
                    </label>
                   
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
                 {/* Conditional Rendering of Edit Profile or Follow Button */}
          
              </div>
              <div className="infoContainer">
                {loggedinuser[0]?.bio ? <p>{loggedinuser[0].bio}</p> : ""}
               
                <FollowSection user={user}/>
              </div>
              <h4 className="tweetsText">Tweets</h4>
              <hr />
            </div>
           {/* Customization Popup */}
      

            {posts.map((p) => (
              <Post p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;