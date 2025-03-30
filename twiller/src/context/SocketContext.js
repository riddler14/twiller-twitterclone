// File: src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
// import { useUserAuth } from "./UserAuthContext";
import useLoggedinuser from "../hooks/useLoggedinuser";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
const [socket, setSocket] = useState(null);
const [loggedinuser] = useLoggedinuser();


const userEmail=encodeURIComponent(loggedinuser?.email);
useEffect(() => {
// Initialize the socket connection

const newSocket = io("https://twiller-twitterclone-2-q41v.onrender.com", {
transports: ["websocket"],
query:{email:userEmail}, // Placeholder for email
});

setSocket(newSocket);

return () => {
newSocket.disconnect(); // Clean up the socket connection on unmount
};
}, [userEmail]);

return (
<SocketContext.Provider value={socket}>
{children}
</SocketContext.Provider>
);
};