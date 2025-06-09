import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import './Feed.css';
import Posts from './Posts/Posts';
import Tweetbox from './Tweetbox/Tweetbox';
import { useTranslation } from 'react-i18next';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const { t } = useTranslation();

    // Memoize fetchPosts to prevent unnecessary re-creations if it were a dependency
    const fetchPosts = useCallback(() => {
        fetch("https://twiller-twitterclone-2-q41v.onrender.com/post")
            .then((res) => res.json())
            .then((data) => {
                const normalizedData = Array.isArray(data) ? data : [];
                setPosts(normalizedData);
            })
            .catch((error) => {
                console.error("Error fetching posts:", error);
            });
    }, []); // Empty dependency array for fetchPosts itself

    // This useEffect will run only once when the component mounts
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]); // fetchPosts is a stable function due to useCallback

    // Handler for when a new post is successfully made in Tweetbox
    const handleNewPostSuccess = useCallback(() => {
        fetchPosts(); // Re-fetch all posts to include the new one
    }, [fetchPosts]);

    // Handler for when a post is deleted from the Posts component
    const handlePostDelete = useCallback((deletedPostId) => {
        // Option 1: Filter locally (faster UI update for deletion)
        setPosts((prevPosts) => prevPosts.filter((p) => p._id !== deletedPostId));

        // Option 2 (If you prefer a full re-fetch after deletion):
        // fetchPosts();
    }, []); // Empty dependency array for handlePostDelete as it doesn't depend on outside state

    console.log(posts);

    return (
        <div className="feed">
            <div className="feed__header">
                <h2>{t('Home')}</h2>
            </div>
            {/* Pass the handleNewPostSuccess callback to Tweetbox */}
            <Tweetbox onPostSuccess={handleNewPostSuccess} />
            {posts.map((p) => (
                <Posts
                    key={p._id}
                    p={p}
                    // 'posts' prop might not be needed in Posts component for simple display/delete
                    // posts={posts}
                    onPostDelete={handlePostDelete} // Pass the delete handler
                />
            ))}
        </div>
    );
};

export default Feed;