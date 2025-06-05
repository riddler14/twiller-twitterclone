import './App.css';
import { useEffect,useState } from 'react';
import {Routes,Route} from 'react-router-dom';
import Home from './Pages/Home';
import Login from "./Pages/Login/Login";
import Signup from "./Pages/Login/Signup";
import ResetPass from './Pages/Login/ResetPass';
import Feed from "./Pages/Feed/Feed";
import Explore from "./Pages/Explore/Explore";
import Notification from "./Pages/Notification/Notification";
import Message from "./Pages/Messages/Message";
//import ProtectedRoute from "./Pages/ProtectedRoute";
import Lists from "./Pages/Lists/Lists";
import Chatbot from "./Pages/Chatbot/chatbot";
import Subscribe from "./Pages/Subscription/subscribe";
import Profile from "./Pages/Profile/Profile";
import More from "./Pages/more/More";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import Bookmark from "./Pages/Bookmark/Bookmark";
import ProfileUser from "./Pages/Profile/ProfileUser";
import NotificationManager from './components/NotificationManager';
import { I18nextProvider, useTranslation } from 'react-i18next';
import UserFeed from './Pages/Feed/UserFeed';
import Followers from './Pages/Profile/Mainprofile/Followers';
import Following from './Pages/Profile/Mainprofile/Following';
import axios from "axios";
function App() {
  const { i18n } = useTranslation();
  const [isRestricted, setIsRestricted] = useState(false);
  const [loading, setLoading] = useState(true);
   useEffect(() => {
    // Load the saved language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'en'; // Default to 'en'
    i18n.changeLanguage(savedLanguage).catch((error) => {
      console.error('Failed to load saved language:', error);
    });
  }, [i18n]);
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Make a simple GET request to your backend's root or a dedicated endpoint.
        // It's crucial this request hits your Node.js server (e.g., port 5000).
        // Adjust the URL if your backend is hosted differently in production.
        await axios.get("https://twiller-twitterclone-2-q41v.onrender.com"); 
        // If the request succeeds (not 403), access is allowed
        setIsRestricted(false);
      } catch (error) {
        // If the backend sends a 403 status (or any other error indicating restriction)
        if (error.response && error.response.status === 403) {
          setIsRestricted(true);
        } else {
          // Handle other potential errors (network issues, other server errors)
          console.error("Error checking access:", error);
          // You might choose to still show the app or a generic error page
          setIsRestricted(false); 
        }
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []); // Run once on component mount

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Loading application...</p>
      </div>
    );
  }

  if (isRestricted) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '5px', color: '#721c24', margin: '20px' }}>
        <h1>Access Restricted</h1>
        <p>Displaying the website on mobile devices is only allowed between 10 AM and 1 PM IST.</p>
        <p>Please try again during the allowed hours or access the website from a desktop device.</p>
        <p style={{fontSize: '0.8em', color: '#a00'}}>Your current time is: {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST</p>
      </div>
    );
  }
 
  return (
   <div className='app'>
    <I18nextProvider i18n={i18n}>
    <UserAuthContextProvider>
      <NotificationManager />
      <Routes>
          <Route path="/" element={<Home/>}>
            <Route index element={<Feed/>}/>
            
          </Route>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/resetpass" element={<ResetPass />} />
          
          <Route path="/home" element={<Home />}>
            <Route path="feed" element={<Feed />} />
            <Route path="feed/:postId" element={<UserFeed />} />

            <Route path="explore" element={<Explore />} />
            <Route path="notification" element={<Notification />} />
            <Route path="messages" element={<Message />} />
            <Route path="lists" element={<Lists />} />
            <Route path='chatbot' element={<Chatbot/>}/>
            <Route path='subscribe' element={<Subscribe/>}/>
            <Route path="bookmarks" element={<Bookmark />} />
            <Route path="profile" element={<Profile />} />
            

            <Route path="more" element={<More />} />
            <Route path="profile/:id" element={<ProfileUser />} />
            <Route path="profile/:email" element={<ProfileUser />} />
            <Route path="profile/followers" element={<Followers />} />
            <Route path="profile/following" element={<Following />} />
          </Route>
          {/* Dynamic Profile Route */}
          

          {/* Fallback Route */}
          <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
      </UserAuthContextProvider>
      </I18nextProvider>
   </div>
  );
}

export default App;
