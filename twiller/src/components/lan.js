// src/components/ExampleComponent.js
import React from 'react';
import { useTranslation } from 'react-i18next';

const lan = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('es')}>Spanish</button>
      <button onClick={() => changeLanguage('hi')}>Hindi</button>
      <button onClick={() => changeLanguage('pt')}>Portuguese</button>
      <button onClick={() => changeLanguage('zh')}>Chinese</button>
      <button onClick={() => changeLanguage('fr')}>French</button>
    </div>
  );
};

export default lan;