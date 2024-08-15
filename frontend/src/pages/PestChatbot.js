import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PestChatbot.css';
import Header from '../components/Header';
import CategoryCard from '../components/CategoryCard';
import { useTranslation } from 'react-i18next';

const PestChatbot = () => {
    const { t, i18n } = useTranslation();
    const [cropName, setCropName] = useState('');
    const [image, setImage] = useState(null);
    const [responseDetails, setResponseDetails] = useState('');
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [disease, setDisease] = useState('');

    useEffect(() => {
        const storedLanguage = localStorage.getItem('languagePreference') || 'en';
        i18n.changeLanguage(storedLanguage).catch(err => console.error('Error changing language:', err));
    }, []);

    const categories = [
        t('Pest and Diseases'),
        t('Pesticide Recommendation'),
        t('Irrigation Schedules'),
        t('Crop Rotation Advice')
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            if (image) {
                const formData = new FormData();
                formData.append('image', image);

                const response = await axios.post('https://krishi-vikas.onrender.com/predict-disease', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                setResponseDetails(response.data.prediction || '');
                setDisease(response.data.prediction || '');
            } 
        } catch (err) {
            console.error('Error fetching response:', err);
            setError(t(''));
        }
    };

    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        setError(null);

        try {
            const response = await axios.post('https://krishi-vikas.onrender.com/crop_steps', {
                crop_name: cropName ? cropName : disease,
                language: localStorage.getItem('languagePreference') || 'en',
                category: category
            });

            setResponseDetails(response.data || '');
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(t(''));
        }
    };

    return (
        <>
            <Header name={t('Pest Disease Chatbot')} />
            <div className="crop-detail-page">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="cropName">{t('Crop Name')}:</label>
                        <input
                            type="text"
                            id="cropName"
                            value={cropName}
                            onChange={(e) => setCropName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="imageUpload">{t('Upload an Image')}:</label>
                        <input
                            type="file"
                            id="imageUpload"
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </div>
                    <button type="submit">{t('Submit')}</button>
                </form>
                <div className="category-cards">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category}
                            category={category}
                            details={selectedCategory === category ? responseDetails : ''}
                            onClick={() => handleCategoryClick(category)}
                        />
                    ))}
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>
        </>
    );
};

export default PestChatbot;
