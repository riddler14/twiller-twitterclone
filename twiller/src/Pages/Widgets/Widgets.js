import React,{useState} from 'react'
import "./widget.css";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import WidgetsIcon from '@mui/icons-material/Widgets';
import { TwitterTimelineEmbed, TwitterTweetEmbed } from "react-twitter-embed";
const Widgets=()=>{
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);

  const toggleWidgets = () => {
    setIsWidgetsOpen(!isWidgetsOpen);
  };
    return(
      <>
      {/* Toggle Button for Mobile */}
      <div className="toggle-widgets">
        <IconButton onClick={toggleWidgets}>
          <WidgetsIcon style={{ fontSize: "30px", cursor: "pointer" }} />
        </IconButton>
      </div>
        <div className={`widgets ${isWidgetsOpen ? "active" : ""}`}>
        <div className="widgets__input">
          <SearchIcon className="widget__searchIcon" />
          <input placeholder="Search Twitter" type="text" />
        </div>
        <div className="widgets__widgetContainer">
          <h2>What's Happening</h2>
          <TwitterTweetEmbed tweetId={"1811030889922711622"} />
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName="Maharashtra"
            options={{ height: 400 }}
          />
        </div>
      </div>
      </>
    );
};
export default Widgets;