// File: src/context/SocketContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useLoggedinuser from "../hooks/useLoggedinuser";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  // useLoggedinuser will likely return [null, ...] initially, then [userData, ...]
  const [loggedinuser, isLoading] = useLoggedinuser(); // Assuming useLoggedinuser might also return an isLoading flag

  // Line 14: This is where the error originates.
  // We need to ensure loggedinuser and its email are available before using them.
  const userEmail = loggedinuser?.email ? encodeURIComponent(loggedinuser.email) : null;

  useEffect(() => {
    // Only attempt to initialize the socket if a user is logged in AND has an email
    // and if there's no existing socket or the user email has changed
    if (loggedinuser && userEmail) { // <-- Crucial check here
      const newSocket = io("https://twiller-twitterclone-2-q41v.onrender.com", {
        transports: ["websocket"],
        query: { email: userEmail },
      });

      setSocket(newSocket);

      return () => {
        // Only disconnect if a socket was actually created
        if (newSocket) {
          newSocket.disconnect(); // Clean up the socket connection on unmount
        }
      };
    } else {
      // If no user or email, ensure socket is null and disconnected if it existed
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [loggedinuser, userEmail]); // Re-run effect if loggedinuser or userEmail changes

  // Optional: You might want to render a loading state or nothing if the user is not yet loaded
  // or if socket connection is pending, depending on your UI/UX needs.
  // For now, we'll just pass null for socket until it's ready.

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};