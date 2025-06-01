import { useState } from "react";
import TwitterIcon from "@mui/icons-material/Twitter";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChatBubbleIcon from "@mui/icons-material/ChatBubbleTwoTone";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MoreIcon from "@mui/icons-material/More";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Divider from "@mui/material/Divider";
import DoneIcon from "@mui/icons-material/Done";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Avatar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import VerifiedIcon from '@mui/icons-material/Verified';
import "./sidebar.css";
import Customlink from "./Customlink";
import Sidebaroption from "./Sidebaroption";
import { useNavigate } from "react-router-dom";
import useLoggedinuser from "../../hooks/useLoggedinuser";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Sidebar = ({ handlelogout, user }) => {
  const [anchorE1, setanchorE1] = useState(null);
  const {t}=useTranslation();
  const openmenu = Boolean(anchorE1);
  //const {loggedinuser}=[]
  
  const [loggedinuser] = useLoggedinuser();
  const username=loggedinuser[0]?.username;
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleclick = (e) => {
    setanchorE1(e.currentTarget);
    // console.log(e.currentTarget);
  };
  const handleclose = () => {
    setanchorE1(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const result = username || user?.email?.split("@")[0];
  return (
    <>
      {/* Hamburger Menu for Mobile */}
      <div className="hamburger-menu">
        <IconButton onClick={toggleSidebar}>
          <MoreHorizIcon style={{ fontSize: "30px", cursor: "pointer" }} />
        </IconButton>
      </div>

      <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
        <TwitterIcon className="sidebar__twitterIcon" />
        <LanguageSwitcher/>
        <Customlink to="/home/feed">
          <Sidebaroption active Icon={HomeIcon} text={t("Home")} />
        </Customlink>
        <Customlink to="/home/explore">
          <Sidebaroption Icon={SearchIcon} text={t("Explore")} />
        </Customlink>
        <Customlink to="/home/notification">
          <Sidebaroption Icon={NotificationsNoneIcon} text={t("Notifications")} />
        </Customlink>
        <Customlink to="/home/messages">
          <Sidebaroption Icon={MailOutlineIcon} text={t("Messages")} />
        </Customlink>
        <Customlink to="/home/bookmarks">
          <Sidebaroption Icon={BookmarkBorderIcon} text={t("Bookmarks")} />
        </Customlink>
        <Customlink to="/home/lists">
          <Sidebaroption Icon={ListAltIcon} text={t("Lists")} />
        </Customlink>
        <Customlink to="/home/chatbot">
          <Sidebaroption Icon={ChatBubbleIcon} text={t("Chatbot")} />
        </Customlink>
         <Customlink to="/home/subscribe">
          <Sidebaroption Icon={VerifiedIcon} text={t("Subscribe")} />
        </Customlink>
        <Customlink to="/home/profile">
          <Sidebaroption Icon={PermIdentityIcon} text={t("Profile")} />
        </Customlink>
        <Customlink to="/home/more">
          <Sidebaroption Icon={MoreIcon} text={t("More")} />
        </Customlink>
        <Button variant="outlined" className="sidebar__tweet" fullWidth>
          {t('Make a Post')}
        </Button>
        <div className="Profile__info">
          <Avatar
            src={
              loggedinuser[0]?.profileImage
                ? loggedinuser[0].profileImage
                : user && user.photoURL
              //: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
            }
          />
          <div className="user__info">
            <h4>
              {loggedinuser[0]?.name
                ? loggedinuser[0].name
                : user && user.displayName}
            </h4>
            <h5>@{result}</h5>
          </div>
          <IconButton
            size="small"
            sx={{ ml: 2 }}
            aria-controls={openmenu ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-valuetext={openmenu ? "true" : undefined}
            onClick={handleclick}
          >
            <MoreHorizIcon />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorE1}
            open={openmenu}
            onClick={handleclose}
            onClose={handleclose}
          >
            <MenuItem
              className="Profile__info1"
              onClick={() => navigate("/home/profile")}
            >
              <Avatar
                src={
                  loggedinuser[0]?.profileImage
                    ? loggedinuser[0].profileImage
                    : user && user.photoURL
                  //: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
                }
              />
              <div className="user__info subUser__info">
                <div>
                  <h4>
                    {loggedinuser[0]?.name
                      ? loggedinuser[0].name
                      : user && user.displayName}
                  </h4>
                  <h5>@{result}</h5>
                </div>
                <ListItemIcon className="done__icon" color="blue">
                  <DoneIcon />
                </ListItemIcon>
              </div>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleclose}>{t('Add an existing account')}</MenuItem>
            <MenuItem onClick={handlelogout}>{t('Log out')} @{result}</MenuItem>
          </Menu>
          
        </div>
      </div>
    </>
  );
};
export default Sidebar;
