import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CropCard from '../components/Card';
import { useTranslation } from 'react-i18next';
import '../styles/CropRecommendation.css';
import Header from '../components/Header';

const cropCategories = [
    { title: 'Vegetables', image: 'images/vegetable.png' },
    { title: 'Fruits', image: 'images/fruits.png' },
    { title: 'Cereal Crops', image: 'images/cereal.png' },
    { title: 'Legumes', image: 'images/legumes.png' },
    { title: 'Oil Crops', image: 'images/oil.png' },
    { title: 'Spices', image: 'images/spices.png' },
    { title: 'Fiber Crops', image: 'images/fiber.png' },
    { title: 'Medicinal Crops', image: 'images/medicine.png' }
];

const CropRecommendation = () => {
    const { t, i18n } = useTranslation();
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve language from localStorage
        const language = localStorage.getItem('languagePreference') || 'en';
        i18n.changeLanguage(language).catch(err => setError(t('errorChangingLanguage', { err: err.message })));

        // Retrieve latitude and longitude from localStorage
        const storedLatitude = localStorage.getItem('latitude');
        const storedLongitude = localStorage.getItem('longitude');
        if (storedLatitude && storedLongitude) {
            setLatitude(parseFloat(storedLatitude));
            setLongitude(parseFloat(storedLongitude));
        }
    }, []);

    const handleCategoryClick = (category) => {
        navigate(`/crop/${category.title}`, {
            state: { latitude, longitude }
        });
    };

    return (
        <>
            <Header name={t('Type of Crop')} />
            <div className="crop-recommendation-page">
                {latitude && longitude ? (
                    <div>
                        <div className="crop-category-container">
                            {cropCategories.map((category) => (
                                <CropCard
                                    key={category.title}
                                    title={t(category.title)}
                                    image={category.image}
                                    onClick={() => handleCategoryClick(category)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <p>{t('locationNotAvailable')}</p>
                )}
                {error && <p className="error">{error}</p>}
            </div>
        </>
    );
};

export default CropRecommendation;
