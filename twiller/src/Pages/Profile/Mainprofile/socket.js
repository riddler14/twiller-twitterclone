import io from "socket.io-client";

// Initialize the socket connection
const socket = io("https://twiller-twitterclone-2-q41v.onrender.com");

// Function to listen for notifications
export const listenForNotifications = (userEmail, onNotification) => {
  socket.on(`notification-${userEmail}`, (notification) => {
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.body,
        icon: "/path-to-your-app-icon.png", // Optional: Add an app icon
      });
    }
    // Optionally, call a callback function to update the UI
    if (onNotification) {
      onNotification(notification);
    }
  });
};

// Export the socket instance in case it's needed elsewhere
export default socket;