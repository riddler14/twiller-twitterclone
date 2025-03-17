// File: src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUserAuth } from "./UserAuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
const [socket, setSocket] = useState(null);
const {user}=useUserAuth();

const userEmail=encodeURIComponent(user.email);
useEffect(() => {
// Initialize the socket connection
console.log("User's email: ",user.email);
console.log("User's email: ",userEmail);
const newSocket = io("https://twiller-twitterclone-2-q41v.onrender.com", {
transports: ["websocket"],
query:{email:userEmail}, // Placeholder for email
});

setSocket(newSocket);

return () => {
newSocket.disconnect(); // Clean up the socket connection on unmount
};
}, [user?.email]);

return (
<SocketContext.Provider value={socket}>
{children}
</SocketContext.Provider>
);
};