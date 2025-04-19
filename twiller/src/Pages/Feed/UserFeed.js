import React, { useState, useEffect } from "react";
import "./Feed.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import UserPost from "./Posts/UserPost";
import { useParams } from "react-router-dom";
import CommentBox from "./Posts/CommentBox";
const UserFeed = () => {
  const { postId } = useParams();
  
  const [post, setpost] = useState([]);
  const { t } = useTranslation();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log("Id Of the Post: ",postId)
        const response = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/post/${postId}`
        );
        if (response.data.post) {
          setpost(response.data.post);
        } else {
          alert("Post not found.");
          navigate("/"); // Redirect to home if post is not found
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        alert("Failed to fetch post. Please try again.");
        navigate("/");
      }
    };
    fetchPost();
  }, [postId, navigate]);

  console.log(post);

  if (!post) {
    return <div>Loading...</div>;
  }
  // const data = [
  //       {
  //         _id: "1",
  //         name: "Jane Doe",
  //         username: "jane_doe",
  //         profilePhoto: "https://example.com/profiles/jane.jpg",
  //         post: "Exploring the new features in JavaScript! 🚀 #coding #JavaScript",
  //         photo: "https://example.com/posts/javascript.png",
  //       },
  //       {
  //         _id: "2",
  //         name: "John Smith",
  //         username: "johnsmith",
  //         profilePhoto: "https://example.com/profiles/john.jpg",
  //         post: "Just finished a great workout session! 💪 #fitness #health",
  //         photo: "https://example.com/posts/workout.png",
  //       },
  //       {
  //         _id: "3",
  //         name: "Alice Johnson",
  //         username: "alicejohnson",
  //         profilePhoto: "https://example.com/profiles/alice.jpg",
  //         post: "Loving the new features in CSS! #webdevelopment #design",
  //         photo: "https://example.com/posts/css.png",
  //       },
  //     ];
  return (
    <div className="feed">
      <div className="feed__header">
        <h2>{t("Post")}</h2>
      </div>

      {post && <UserPost key={postId} p={post} />}
     <CommentBox a={postId}/>
    </div>
  );
};
export default UserFeed;
