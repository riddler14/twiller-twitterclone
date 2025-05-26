import {useEffect} from 'react'
import Widgets from "./Widgets/Widgets";
import Sidebar from "./Sidebar/sidebar";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { useSocket } from "../context/SocketContext";


const Home=()=>{
  const {logOut,user}=useUserAuth()
  const navigate = useNavigate();
  const socket = useSocket();
  useEffect(() => {
    if (socket && user?.email) {
      // Update the socket query with the user's email
      socket.io.opts.query = { email: user.email };
      socket.connect(); // Reconnect with the updated query
    }
  }, [socket, user?.email]);
    // const user = {
    // displayName: "bithead",
    // email: "bithead@gmail.com",
  //};

    const handlelogout = async () => {
        try {
          await logOut()
          navigate("/login");
        } catch (error) {
          console.log(error.message);
        }
      };
    return(
        <div className="app">
          
      <Sidebar handlelogout={handlelogout} user={user} />
      <Outlet />
      <Widgets />
    </div>
    );
};
export default Home;