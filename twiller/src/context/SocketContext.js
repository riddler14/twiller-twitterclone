// File: src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
const [socket, setSocket] = useState(null);

useEffect(() => {
// Initialize the socket connection
const newSocket = io("https://twiller-twitterclone-2-q41v.onrender.com", {
transports: ["websocket"],
query:"" // Placeholder for email
});

setSocket(newSocket);

return () => {
newSocket.disconnect(); // Clean up the socket connection on unmount
};
}, []);

return (
<SocketContext.Provider value={socket}>
{children}
</SocketContext.Provider>
);
};