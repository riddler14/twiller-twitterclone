// File: src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUserAuth } from "../context/UserAuthContext"; // Import your UserAuthContext

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { loggedinuser } = useUserAuth(); // Retrieve loggedinuser from UserAuthContext
  const userEmail = loggedinuser?.email; // Extract the user's email

  useEffect(() => {
    if (!userEmail) {
      console.warn("User email is missing. Cannot establish WebSocket connection.");
      return;
    }

    // Initialize the socket connection
    const newSocket = io("wss://twiller-twitterclone-2-q41v.onrender.com", {
      transports: ["websocket"], // Force WebSocket transport
      query: { email: userEmail }, // Pass the user's email as a query parameter
    });

    // Log connection events for debugging
    newSocket.on("connect", () => {
      console.log("WebSocket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // Clean up the socket connection on unmount
      console.log("WebSocket disconnected");
    };
  }, [userEmail]); // Reinitialize the socket if the userEmail changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};