import React from "react";
import "../pages.css";
import { useTranslation } from "react-i18next";
const Bookmark = () => {
  const {t}=useTranslation();
  return (
    <div className="page">
      <h2 className="pageTitle">{t('Welcome to Bookmark page')}</h2>
    </div>
  );
};

export default Bookmark;
