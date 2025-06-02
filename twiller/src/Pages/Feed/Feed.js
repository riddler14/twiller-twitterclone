import {useState,useEffect }from 'react'
import './Feed.css'
import Posts from './Posts/Posts'
import Tweetbox from './Tweetbox/Tweetbox';
import { useTranslation } from 'react-i18next';
const Feed=()=>{
    const [post, setpost] = useState([]);
    const {t}=useTranslation();
    useEffect(() => {
      fetch("https://twiller-twitterclone-2-q41v.onrender.com/post")
        .then((res) => res.json())
        .then((data) => {
          const normalizedData = Array.isArray(data) ? data : []; // Ensure data is an array
      setpost(normalizedData);
        })
        .catch((error) => {
          console.error("Error fetching posts:", error);
        });
        
    },[post]);
    console.log(post)
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
        <h2>{t('Home')}</h2>
      </div>
      <Tweetbox />
      {post.map((p) => (
        <Posts key={p._id} p={p} posts={post}/>
      ))}
    </div>
    );
};
export default Feed;