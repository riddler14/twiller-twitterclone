import { useState, useEffect } from 'react';
import './Feed.css';
import Posts from './Posts/Posts';
import Tweetbox from './Tweetbox/Tweetbox';
import { useTranslation } from 'react-i18next';

const Feed = () => {
    const [posts, setPosts] = useState([]); // Renamed 'post' to 'posts' for clarity, as it holds an array
    const { t } = useTranslation();

    // Function to fetch posts from the backend
    const fetchPosts = () => {
        fetch("https://twiller-twitterclone-2-q41v.onrender.com/post")
            .then((res) => res.json())
            .then((data) => {
                const normalizedData = Array.isArray(data) ? data : [];
                setPosts(normalizedData);
            })
            .catch((error) => {
                console.error("Error fetching posts:", error);
            });
    };

    useEffect(() => {
        // Fetch posts when the component mounts
        fetchPosts();
    }, []); // Empty dependency array means this effect runs only once on mount

    // Handler for when a post is deleted from the Posts component
    const handlePostDelete = (deletedPostId) => {
        // Update the state to remove the deleted post, triggering a re-render
        setPosts((prevPosts) => prevPosts.filter((p) => p._id !== deletedPostId));
        // Optionally, you could re-fetch all posts if you want to be absolutely sure
        // fetchPosts(); // Uncomment this line if you prefer a full re-fetch after deletion
    };

    console.log(posts);

    return (
        <div className="feed">
            <div className="feed__header">
                <h2>{t('Home')}</h2>
            </div>
            <Tweetbox />
            {posts.map((p) => (
                <Posts
                    key={p._id}
                    p={p}
                    posts={posts} // Pass the entire posts array (though not strictly necessary for deletion logic here)
                    onPostDelete={handlePostDelete} // Pass the delete handler
                />
            ))}
        </div>
    );
};

export default Feed;