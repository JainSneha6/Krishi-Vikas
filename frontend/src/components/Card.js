import React from 'react';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook

const CropCard = ({ title, image, onClick }) => {
    const { t } = useTranslation(); // Initialize the translation function

    return (
        <div className="crop-card" onClick={onClick}>
            <img src={image} alt={t(title)} className="crop-card-image" /> {/* Translate the alt text */}
            <h3 className="crop-card-title">{t(title)}</h3> {/* Translate the title */}
        </div>
    );
};

export default CropCard;
