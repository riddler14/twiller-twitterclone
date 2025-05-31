import {useState,useRef,useEffect,useCallback} from 'react'
import "./widget.css";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import WidgetsIcon from '@mui/icons-material/Widgets';
import useLoggedinuser from "../../hooks/useLoggedinuser";
import { TwitterTimelineEmbed, TwitterTweetEmbed } from "react-twitter-embed";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Widgets=()=>{
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggedinuser] = useLoggedinuser();
  const {t}=useTranslation();
  const navigate=useNavigate();
  // Function to handle search
  const dropdownRef = useRef(null);
  
  const handleSearch = useCallback(async (e) => {
    if (e) {
      e.preventDefault(); // Only call preventDefault if `e` exists
    }
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await fetch(
        `https://twiller-twitterclone-2-q41v.onrender.com/search-users?query=${encodeURIComponent(
          searchTerm
        )}&email=${loggedinuser[0]?.email}`
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
  }, [searchTerm, loggedinuser]);


  const handleUserClick = (userId) => {
    navigate(`/home/profile/${userId}`); // Navigate to the user's profile page
    setShowDropdown(false);
    setSearchTerm("");
    console.log("running....",userId); // Hide the dropdown after navigation
  };
  // Use useEffect to trigger search dynamically with debounce
  const handleClickOutside = () => {
    
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Add event listener for clicks outside the dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        handleClickOutside();
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleOutsideClick);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounce);
  },[searchTerm,handleSearch]);

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
        <div className="widgets__input"  ref={dropdownRef} >
          <SearchIcon className="widget__searchIcon" />
          <input
          type="text"
          placeholder={t("Search Twiller")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
        />
        </div>

        {showDropdown && searchResults.length > 0 && (
          <div className="widgets__dropdown" ref={dropdownRef}>
            {searchResults.map((user) => (
              <div key={user._id} className="dropdown-item" onClick={() => handleUserClick(user._id)}>
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
          <h2>{t("What's Happening")}</h2>
          <TwitterTweetEmbed tweetId={"1811030889922711622"} />
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName="HelloMTDC"
            options={{ height: 400 }}
          />
        </div>
      </div>
      </>
    );
};
export default Widgets;