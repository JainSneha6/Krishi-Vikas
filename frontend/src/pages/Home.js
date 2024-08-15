import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/Home.css';

const HomePage = () => {
  const [language, setLanguage] = useState(localStorage.getItem('languagePreference') || 'en');
  const [latitude, setLatitude] = useState(localStorage.getItem('latitude') || null);
  const [longitude, setLongitude] = useState(localStorage.getItem('longitude') || null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language).catch(err => setError(t('errorChangingLanguage', { err: err.message })));
  }, [language]);

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleLanguageSubmit = () => {
    if (language) {
      localStorage.setItem('languagePreference', language);
      i18n.changeLanguage(language).catch(err => setError(t('errorChangingLanguage', { err: err.message })));
    } else {
      setError(t('selectLanguageError'));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          localStorage.setItem('latitude', position.coords.latitude);
          localStorage.setItem('longitude', position.coords.longitude);
        },
        () => {
          setError(t('locationRetrievalError'));
        }
      );
    } else {
      setError(t('geolocationNotSupported'));
    }
  };

  return (
    <div className="home-page">
      <h1>{t('Growing Dreams, one seed at a time')}</h1>
      <h2>{t('Select Language')}</h2>
      <div className="language-selector">
        <select value={language} onChange={handleLanguageChange}>
          <option value="">{t('select Language Option')}</option>
          <option value="en">{t('English')}</option>
          <option value="hi">{t('हिंदी')}</option>
          <option value="mr">{t('मराठी')}</option>
          <option value="gu">{t('ગુજરાતી')}</option>
          <option value="bn">{t('বাংলা')}</option>
          <option value="te">{t('తెలుగు')}</option>
          <option value="ta">{t('தமிழ்')}</option>
          <option value="ml">{t('മലയാളം')}</option>
          <option value="kn">{t('ಕನ್ನಡ')}</option>
        </select>
        <button onClick={handleLanguageSubmit}>{t('Submit')}</button>
      </div>
      <button onClick={getLocation}>{t('Get My Location')}</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default HomePage;
