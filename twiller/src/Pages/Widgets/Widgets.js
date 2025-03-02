import React,{useState,useRef,useEffect} from 'react'
import "./widget.css";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import WidgetsIcon from '@mui/icons-material/Widgets';
import { TwitterTimelineEmbed, TwitterTweetEmbed } from "react-twitter-embed";
const Widgets=()=>{
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Function to handle search
  const dropdownRef = useRef(null);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await fetch(
        `https://twiller-twitterclone-1-j9kj.onrender.com/search-users?query=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();

      if (data.users) {
        setSearchResults(data.users);
        setShowDropdown(true); // Show dropdown when results are fetched
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


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
        {/* Search Input */}
        <div className="widgets__input"  ref={dropdownRef}>
          <SearchIcon className="widget__searchIcon" />
          <input
          type="text"
          placeholder="Search Twiller"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
        />
        </div>

        {showDropdown && searchResults.length > 0 && (
          <div className="widgets__dropdown">
            {searchResults.map((user) => (
              <div key={user._id} className="dropdown-item">
                <img
                  src={user.profileImage || "https://via.placeholder.com/50"}
                  alt={`${user.name}'s avatar`}
                  className="dropdown-avatar"
                />
                <div className="dropdown-info">
                  <h3>{user.name}</h3>
                  <p>@{user.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}



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