import React from 'react'
import { Avatar } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/Verified";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";

const posts = ({p}) => {
    const { name, username, photo, post, profilephoto,audio } = p;
    return (
      <div className="post">
        <div className="post__avatar">
          <Avatar src={profilephoto} />
        </div>
        <div className="post__body">
          <div className="post__header">
            <div className="post__headerText">
              <h3>
                {name}{" "}
                <span className="post__headerSpecial">
                  <VerifiedUserIcon className="post__badge" /> @{username}
                </span>
              </h3>
            </div>
            <div className="post__headerDescription">
              <p>{post}</p>
            </div>
          </div>
          <img src={photo} alt="" width="500" />
          {audio && (
          <div className="post__audio">
            <audio controls style={{ width: "100%" }}>
              <source src={audio} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
          <div className="post__footer">
            <ChatBubbleOutlineIcon
              className="post__footer__icon"
              fontSize="small"
            />
            <RepeatIcon className="post__footer__icon" fontSize="small" />
            <FavoriteBorderIcon className="post__footer__icon" fontSize="small" />
            <PublishIcon className="post__footer__icon" fontSize="small" />
          </div>
        </div>
      </div>
    );
  }

export default posts;