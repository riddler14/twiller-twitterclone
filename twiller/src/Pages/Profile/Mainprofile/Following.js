import React from 'react'
import '../../pages.css'
import { useTranslation } from 'react-i18next';
const Following = () => {
  const {t}=useTranslation();
  return (
    <div className="page">
      <h2 className="pageTitle">{t('Welcome to Following page')}</h2>
    </div>
  )
}

export default Following;