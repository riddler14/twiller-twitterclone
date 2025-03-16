// File: src/components/NotificationManager.js
import  { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

const NotificationManager = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification) => {
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.body,
          icon: "/path-to-your-app-icon.png", // Replace with your app icon path
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(notification.title, {
              body: notification.body,
              icon: "/path-to-your-app-icon.png", // Replace with your app icon path
            });
          }
        });
      }
    };

    // Listen for notifications specific to the user
    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification); // Cleanup listener
    };
  }, [socket]);

  return null; // This component does not render anything
};

export default NotificationManager;