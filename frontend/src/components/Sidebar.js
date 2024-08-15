import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import '../styles/Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation(); // Initialize the translation function

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <button className="close-btn" onClick={toggleSidebar}>×</button>
        <nav>
          <ul>
            <li><Link to="/">{t('Home')}</Link></li>
            <li><Link to="/recommendations">{t('Crop Recommendations')}</Link></li>
            <li><Link to="/pest-chatbot">{t('Pest Disease Chatbot')}</Link></li>
            <li><Link to="/chatbot">{t('Crop Management Chatbot')}</Link></li>
            <li><Link to="/yield-prediction">{t('Crop Yield Prediction & Chatbot')}</Link></li>
            <li><Link to="/expert-chatbot">{t('ExpertBot')}</Link></li>
            <li><Link to="/posts">{t('Posts')}</Link></li>
            <li><Link to="/blogs">{t('Blogs')}</Link></li>
            <li><Link to="/market-trends">{t('market_trends')}</Link></li>
            <li><Link to="/crop-calendar">{t('Crop Calendar')}</Link></li>
          </ul>
        </nav>
      </div>
      <button className="menu-button" onClick={toggleSidebar}>
        {!isOpen ? '☰' : ''}
      </button>
    </>
  );
};

export default Sidebar;
