import React from "react";
import "../pages.css";
// import UserProfile from "./Userprofile/UserProfile";
import { useUserAuth } from "../../context/UserAuthContext";
import UserProfile from "./Userprofile/UserProfile";
const Profile = () => {
  const { user } = useUserAuth();
  // const user = {
  //   displayname: "bithead",
  //   email: "bithead@gmail.com",
  // };
  return (
    <div className="page">
        <UserProfile user={user} />
    </div>
  );
};

export default Profile;