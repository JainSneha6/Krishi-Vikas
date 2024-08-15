import React from "react";
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const Header = ({ name }) => {
  const { t } = useTranslation(); // Initialize the translation function

  return (
    <div className="container">
      <h1>{t(name)}</h1> {/* Use the t function to translate the name prop */}
      <iframe
        src="https://giphy.com/embed/R0MhP0LX2DppguK8fu"
        width="480"
        height="480"
        style={{ border: 0, margin: '0 auto', display: 'block' }}
        frameBorder="0"
        className="giphy-embed"
        allowFullScreen
        title="giphy"
      ></iframe>
    </div>
  );
}

export default Header;
