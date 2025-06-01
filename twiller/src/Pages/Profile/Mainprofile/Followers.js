import React,{useEffect,useState} from 'react'
import '../../pages.css'
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useUserAuth } from "../../../context/UserAuthContext";
const Followers = () => {
  const {t}=useTranslation();
    const { user } = useUserAuth();
      const [loading, setLoading] = useState(true);
      const [followersDetailedList, setFollowersDetailedList] = useState([]); 

  const [error, setError] = useState(null); // State to handle errors
  useEffect(() => {
    const fetchFollowersDetails = async () => {
      if (!user?.email) {
        setError("User email not available. Please log in.");
        setLoading(false);
        return;
      }

      try {
        // STEP 1: Fetch the list of follower emails for the current user
        const followersEmailsResponse = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/followers?email=${user?.email}`
        );
        const followerEmails = followersEmailsResponse.data.followers || []; 

        if (followerEmails.length === 0) {
          setFollowersDetailedList([]);
          setLoading(false);
          return;
        }

        // STEP 2: For EACH follower email, fetch their full profile details
        const followerDetailsPromises = followerEmails.map(async (followerEmail) => {
          try {
            const profileResponse = await axios.get(
              `https://twiller-twitterclone-2-q41v.onrender.com/userprofile?email=${followerEmail}`
            );
            
            const fetchedUser = profileResponse.data.user;

            if (fetchedUser) {
                // *** IMPORTANT CHANGE HERE: Using 'name' and 'username' from backend ***
                return {
                    email: followerEmail, // Keep the email for internal use
                    _id: fetchedUser._id,
                    profileImage: fetchedUser.profileImage,
                    displayName: fetchedUser.name,     // Now directly from backend
                    username: fetchedUser.username,    // Now directly from backend
                };
            } else {
                return { email: followerEmail, displayName: t('Unknown User'), username: '' };
            }

          } catch (profileError) {
            console.error(`Error fetching profile for ${followerEmail}:`, profileError);
            return { email: followerEmail, displayName: t('Error User'), username: '' };
          }
        });

        const detailedFollowers = await Promise.all(followerDetailsPromises);
        setFollowersDetailedList(detailedFollowers.filter(Boolean)); 

      } catch (err) {
        console.error("Error fetching followers list:", err);
        setError("Failed to load followers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowersDetails();
  }, [user?.email, t]);

  if (loading) {
    return <p>{t('Loading followers...')}</p>;
  }

  if (error) {
    return <p className="error-message">{t(error)}</p>;
  }

  return (
    <div className="page">
      <h2 className="pageTitle">{t('Welcome to Followers page')}</h2>

      {followersDetailedList.length > 0 ? (
        <div className="followers-list-container">
          <h3>{t('Your Followers')}:</h3>
          <ul className="followers-list">
            {followersDetailedList.map((follower) => (
              <li key={follower._id || follower.email} className="follower-item">
                {follower.profileImage && (
                  <img 
                    src={follower.profileImage} 
                    alt={follower.displayName || follower.username} 
                    className="follower-avatar" 
                    style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                  />
                )}
                <div className="follower-info">
                  {/* Display name (now from backend's 'name' field) */}
                  <p><strong>{follower.displayName}</strong></p> 
                  {/* Display username (now from backend's 'username' field) */}
                  {follower.username && (
                    <p className="follower-username">@{follower.username}</p>
                  )}
                  {/* You can still display email for debugging or as additional info if needed */}
                  {/* {follower.email && <p className="follower-email">{follower.email}</p>} */}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>{t('You do not have any followers yet.')}</p>
      )}
    </div>
  );

}

export default Followers;