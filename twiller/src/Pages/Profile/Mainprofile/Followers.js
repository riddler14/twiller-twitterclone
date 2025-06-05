import React, { useEffect, useState } from 'react';
import './Followers.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useUserAuth } from "../../../context/UserAuthContext";
import { useNavigate } from 'react-router-dom';
const Followers = () => {
  const { t } = useTranslation();
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [followersDetailedList, setFollowersDetailedList] = useState([]); 
  const [error, setError] = useState(null); 
  const navigate=useNavigate();
  useEffect(() => {
    const fetchFollowersDetails = async () => {
      if (!user?.email) {
        setError("User email not available. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const followersEmailsResponse = await axios.get(
          `https://twiller-twitterclone-2-q41v.onrender.com/followers?email=${user?.email}`
        );
        const followerEmails = followersEmailsResponse.data.followers || []; 

        if (followerEmails.length === 0) {
          setFollowersDetailedList([]);
          setLoading(false);
          return;
        }

        const followerDetailsPromises = followerEmails.map(async (followerEmail) => {
          try {
            const profileResponse = await axios.get(
              `https://twiller-twitterclone-2-q41v.onrender.com/userprofile?email=${followerEmail}`
            );
            
            const fetchedUser = profileResponse.data.user;

            if (fetchedUser) {
                return {
                    email: followerEmail,
                    _id: fetchedUser._id,
                    profileImage: fetchedUser.profileImage,
                    displayName: fetchedUser.name,     
                    username: fetchedUser.username,    
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

  useEffect(() => {
      console.log("11. followingDetailedList state updated (after render):", followersDetailedList);
  }, [followersDetailedList]);

  // Pass the _id to handleUserClick
  const handleUserClick = (id) => { // Changed parameter name to 'id' for clarity
    console.log("Navigating to profile with _id:", id);
    navigate(`/home/profile/${id}`); 
  };

  if (loading) {
    return (
        <div className="follower">
            <div className="follower__header">
                <h2>{t("Followers")}</h2>
            </div>
            <div className="follower__loading">
                <p>{t('Loading followers...')}</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="follower">
            <div className="follower__header">
                <h2>{t("Followers")}</h2>
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
        <h2>{t("Followers")}</h2>
      </div>

      {followersDetailedList.length > 0 ? (
        <div className="follower__list-container">
          {followersDetailedList.map((follower) => {
            // --- NEW LOGIC FOR USERNAME DISPLAY ---
            let displayUsername = follower.username;
            if (!displayUsername && follower.email) {
              // If username is not available, use email as a fallback
              // Check if it's a Gmail address and exclude '@gmail.com'
              if (follower.email.endsWith('@gmail.com')) {
                displayUsername = follower.email.split('@')[0];
              } else {
                // For other emails, just use the full email if username is missing
                displayUsername = follower.email; 
              }
            }
            // --- END NEW LOGIC ---

            return (
              <div className="follower__item" key={follower._id || follower.email} onClick={() => handleUserClick(follower._id)} >
                <div className="follower__avatar-container">
                  {follower.profileImage ? (
                    <img
                      src={follower.profileImage}
                      alt={follower.displayName || displayUsername || 'User'}
                      className="follower__avatar"
                    />
                  ) : (
                    <div className="follower__default-avatar">
                      {follower.displayName ? follower.displayName.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="follower__info">
                  <p className="follower__displayname">
                    <strong>{follower.displayName}</strong>
                  </p>
                  {/* Display the determined username */}
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
          <p>{t('You do not have any followers yet.')}</p>
        </div>
      )}
    </div>
  );
};

export default Followers;