import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import '../styles/CropDetailCard.css';

const CropDetailCard = ({ name, description, image, ename }) => {
    const { t } = useTranslation(); // Initialize the translation function
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/crop-detail/${ename}`);
    };

    return (
        <div className="crop-detail-card" onClick={handleClick}>
            {image && <img src={image} alt={t(name)} className="crop-detail-card-image" />}
            <h3>{t(name)}</h3> {/* Use the t function to translate the name */}
            <p>{t(description)}</p> {/* Use the t function to translate the description */}
        </div>
    );
};

export default CropDetailCard;
