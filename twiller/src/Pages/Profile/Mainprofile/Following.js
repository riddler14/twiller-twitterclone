import React, { useEffect, useState } from 'react';
import './Followers.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useUserAuth } from "../../../context/UserAuthContext";
import { useNavigate } from 'react-router-dom';

const Following = () => {
  const { t } = useTranslation();
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [followingDetailedList, setFollowingDetailedList] = useState([]); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFollowingDetails = async () => { 
      console.log("--- Starting fetchFollowingDetails ---");
      console.log("1. Current user email:", user?.email);

      if (!user?.email) {
        setError("User email not available. Please log in.");
        setLoading(false);
        console.log("1.1 User email not available, aborting fetch.");
        return;
      }

      try {
        console.log(`2. Fetching following emails from: https://twiller-twitterclone-2-q41v.onrender.com/following?email=${user?.email}`);
        const followingEmailsResponse = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/following?email=${user?.email}`
        );
        console.log("3. Response from /following endpoint:", followingEmailsResponse.data);
        
        const followingEmails = followingEmailsResponse.data.following || []; 
        console.log("4. Extracted following emails from response:", followingEmails);

        if (followingEmails.length === 0) {
          setFollowingDetailedList([]);
          setLoading(false);
          console.log("5. No following emails found or array is empty. Displaying 'no following' message.");
          return;
        }

        console.log(`6. Found ${followingEmails.length} users to fetch details for. Starting parallel profile fetches...`);
        const followingDetailsPromises = followingEmails.map(async (followedUserEmail) => {
          try {
            console.log(`  Fetching profile for: https://twiller-twitterclone-2-q41v.onrender.com/userprofile?email=${followedUserEmail}`);
            const profileResponse = await axios.get(
              `https://twiller-twitterclone-2-q41v.onrender.com/userprofile?email=${followedUserEmail}`
            );
            
            const fetchedUser = profileResponse.data.user;
            console.log(`  7. Profile data for ${followedUserEmail}:`, fetchedUser);

            if (fetchedUser) {
                return {
                    email: followedUserEmail,
                    _id: fetchedUser._id,
                    profileImage: fetchedUser.profileImage,
                    displayName: fetchedUser.name,     
                    username: fetchedUser.username,    
                };
            } else {
                console.warn(`  Profile data for ${followedUserEmail} was empty or user not found.`);
                return { email: followedUserEmail, displayName: t('Unknown User'), username: '' };
            }

          } catch (profileError) {
            console.error(`  8. Error fetching profile for ${followedUserEmail}:`, profileError);
            return { email: followedUserEmail, displayName: t('Error User'), username: '' };
          }
        });

        const detailedFollowing = await Promise.all(followingDetailsPromises);
        setFollowingDetailedList(detailedFollowing.filter(Boolean)); 
        console.log("9. Final detailed following list set in state:", detailedFollowing.filter(Boolean));

      } catch (err) {
        console.error("10. Caught error during initial /following fetch or Promise.all:", err);
        setError("Failed to load users you follow. Please try again.");
      } finally {
        setLoading(false);
        console.log("--- fetchFollowingDetails finished ---");
      }
    };

    fetchFollowingDetails();
  }, [user?.email, t]);

  useEffect(() => {
      console.log("11. followingDetailedList state updated (after render):", followingDetailedList);
  }, [followingDetailedList]);

  // Pass the _id to handleUserClick
  const handleUserClick = (id) => { // Changed parameter name to 'id' for clarity
    console.log("Navigating to profile with _id:", id);
    navigate(`/home/profile/${id}`); 
  };

  if (loading) {
    return (
        <div className="follower"> 
            <div className="follower__header">
                <h2>{t("Following")}</h2> 
            </div>
            <div className="follower__loading">
                <p>{t('Loading who you follow...')}</p> 
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="follower">
            <div className="follower__header">
                <h2>{t("Following")}</h2> 
            </div>
            <div className="follower__error">
                <p className="error-message">{t(error)}</p>
            </div>
        </div>
    );
  }

  return (
    <div className="follower">
      <div className="follower__header">
        <h2>{t("Following")}</h2>
      </div>

      {followingDetailedList.length > 0 ? ( 
        <div className="follower__list-container">
          {followingDetailedList.map((followedUser) => { 
            let displayUsername = followedUser.username;
            if (!displayUsername && followedUser.email) {
              if (followedUser.email.endsWith('@gmail.com')) {
                displayUsername = followedUser.email.split('@')[0];
              } else {
                displayUsername = followedUser.email; 
              }
            }

            return (
              // Apply onClick to the entire follower__item for a larger clickable area
              <div 
                className="follower__item" 
                key={followedUser._id || followedUser.email} 
                onClick={() => handleUserClick(followedUser._id)} // <--- FIX IS HERE
              >
                <div className="follower__avatar-container">
                  {followedUser.profileImage ? (
                    <img
                      src={followedUser.profileImage}
                      alt={followedUser.displayName || displayUsername || 'User'}
                      className="follower__avatar"
                    />
                  ) : (
                    <div className="follower__default-avatar">
                      {followedUser.displayName ? followedUser.displayName.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="follower__info"> {/* Removed onClick from here */}
                  <p className="follower__displayname">
                    <strong>{followedUser.displayName}</strong>
                  </p>
                  {displayUsername && (
                    <p className="follower__username">@{displayUsername}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="follower__no-followers"> 
          <p>{t('You do not follow anyone yet.')}</p> 
        </div>
      )}
    </div>
  );
};

export default Following;