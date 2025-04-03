import './App.css';
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
import Profile from "./Pages/Profile/Profile";
import More from "./Pages/more/More";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import Bookmark from "./Pages/Bookmark/Bookmark";
import ProfileUser from "./Pages/Profile/ProfileUser";
import NotificationManager from './components/NotificationManager';


function App() {
  return (
   <div className='app'>
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
            <Route path="explore" element={<Explore />} />
            <Route path="notification" element={<Notification />} />
            <Route path="messages" element={<Message />} />
            <Route path="lists" element={<Lists />} />
            <Route path='chatbot' element={<Chatbot/>}/>
            <Route path="bookmarks" element={<Bookmark />} />
            <Route path="profile" element={<Profile />} />
            
            <Route path="more" element={<More />} />
            <Route path="profile/:id" element={<ProfileUser />} />
            <Route path="profile/:email" element={<ProfileUser />} />
          </Route>
          {/* Dynamic Profile Route */}
          

          {/* Fallback Route */}
          <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
      </UserAuthContextProvider>
   </div>
  );
}

export default App;
