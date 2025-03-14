import io from "socket.io-client";

// Connect to the Socket.IO server
const socket = io("http://localhost:5000", {
  transports: ["websocket"], // Ensure WebSocket transport is used
});

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

export default socket;