import React, { useState, useEffect } from "react";
import Post from "../Posts/posts";
import { useParams, useNavigate } from "react-router-dom";
import "../Mainprofile/Mainprofile.css"; // Use the same CSS as Mainprofile or adjust as needed
import FollowButton from "../Mainprofile/FollowButton"; 
import FollowSection from "../Mainprofile/FollowSection";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


import axios from "axios";
import useLoggedinuser from "../../../hooks/useLoggedinuser";

const UserProfile = () => {
  const navigate = useNavigate();
  // 
  // const { email } = useParams();
  const {id} =useParams();// Extract username from URL
  const [loggedinuser] = useLoggedinuser();
  const [user, setUser] = useState(null); // Profile user data
  const [posts, setPosts] = useState([]); // Posts of the profile user
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch profile user data based on username
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/userprofile/${id}`
        );
        if (response.data.user) {
          setUser(response.data.user); // Set user data
        } else {
          console.error("User not found.",id);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  // Fetch posts for the profile user
  useEffect(() => {
    if (user?.email) {
      fetch(`https://twiller-twitterclone-2-q41v.onrender.com/userpost?email=${user.email}`)
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
      <h4 className="heading-4">{user?.username || user?.email?.split("@")[0]}</h4>
      <div className="mainprofile">
        <div className="profile-bio">
          <div>
            <div className="coverImageContainer">
              <img
                src={
                  user?.coverimage
                    ? user.coverimage
                    : user && user.photoURL
                }
                alt=""
                className="coverImage"
              />
              {/* <div className="hoverCoverImage">
                <div className="imageIcon_tweetButton">
                  <label htmlFor="image" className="imageIcon">
                    {isLoading ? (
                      <LockResetIcon className="photoIcon photoIconDisabled" />
                    ) : (
                      <CenterFocusWeakIcon className="photoIcon" />
                    )}
                  </label>
                 
                </div>
              </div> */}
            </div>
            <div className="avatar-img">
              <div className="avatarContainer">
                <img
                  src={
                     user.profileImage
                  }
                  alt=""
                  className="avatar"
                />
                {/* <div className="hoverAvatarImage">
                  <div className="imageIcon_tweetButton">
                    <label htmlFor="profileImage" className="imageIcon">
                      {isLoading ? (
                        <LockResetIcon className="photoIcon photoIconDisabled" />
                      ) : (
                        <CenterFocusWeakIcon className="photoIcon" />
                      )}
                    </label>
                   
                  </div>
                  
                </div> */}
              </div>
              <div className="userInfo">
                <div>
                  <h3 className="heading-3">
                    {user.name}
                  </h3>
                  <p className="usernameSection">@{user?.username || user?.email?.split("@")[0]}</p>
                </div>
                 {/* Conditional Rendering of Edit Profile or Follow Button */}
                 <FollowButton
              loggedInUserEmail={loggedinuser[0]?.email}
              profileUserEmail={user?.email}
            />
              </div>
              <div className="infoContainer">
                {user?.bio ? <p>{user.bio}</p> : ""}
               
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