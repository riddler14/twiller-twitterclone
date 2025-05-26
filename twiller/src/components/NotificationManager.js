import { useEffect } from "react";
import io from "socket.io-client";
import useLoggedinuser from "../hooks/useLoggedinuser";

const NotificationManager = () => {
  const [loggedinuser] = useLoggedinuser();

  useEffect(() => {
    if (!loggedinuser || !loggedinuser[0]?.email) return;

    // Initialize the Socket.IO client
    const socket = io("https://twiller-twitterclone-2-q41v.onrender.com", {
      query: { email: loggedinuser[0].email }, // Pass the user's email as a query parameter
    });

    // Request notification permissions if not already granted
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      });
    }

    // Listen for notification events from the backend
    socket.on(`notification-${loggedinuser[0].email}`, (data) => {
      if (Notification.permission === "granted") {
        // Show a browser notification
        new Notification(data.title, {
          body: data.body,
        });
      }
    });

    // Cleanup the listener on component unmount
    return () => {
      socket.off(`notification-${loggedinuser[0].email}`);
      socket.disconnect();
    };
  }, [loggedinuser]);

  return null; // This component doesn't render anything
};

export default NotificationManager;