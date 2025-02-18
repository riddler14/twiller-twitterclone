import React from "react";
import "./Sidebaroption.css";
const Sidebaroption = ({ active, text, Icon }) => {
  return (
    <div className={`sidebarOptions ${active && "active"}`}>
      <Icon />
      <h2>{text}</h2>
    </div>
  );
};

export default Sidebaroption;