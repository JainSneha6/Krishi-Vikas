import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import CategoryCard from '../components/CategoryCard';
import { useTranslation } from 'react-i18next';

const YieldPrediction = () => {
    const { t, i18n } = useTranslation(); 
    const [cropName, setCropName] = useState('');
    const [pesticidesTonnes, setPesticidesTonnes] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [weatherData, setWeatherData] = useState({ avgRainfall: 0, avgTemp: 0 });
    const [chatbotResponse, setChatbotResponse] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = [
        t('Yield Improvement Tips'),
        t('Optimal Type of Fertilizer'),
        t('Quantity of Fertilizer')
    ];

    useEffect(() => {
        const language = localStorage.getItem('languagePreference') || 'en';
        i18n.changeLanguage(language).catch(err => console.error(`Error changing language: ${err}`));
    }, []);

    const getWeatherData = async () => {
        try {
            const response = await axios.post('https://krishi-vikas.onrender.com/weather_data', {
                latitude: localStorage.getItem('latitude'),
                longitude: localStorage.getItem('longitude'),
            });
            setWeatherData({
                avgRainfall: response.data.average_rain_fall_mm_per_year,
                avgTemp: response.data.avg_temp,
            });
        } catch (err) {
            setError(t('errorFetchingWeatherData'));
        }
    };

    const getYieldPrediction = async () => {
        try {
            const response = await axios.post('https://krishi-vikas.onrender.com/yield-prediction', {
                crop_name: cropName,
                average_rain_fall_mm_per_year: weatherData.avgRainfall,
                pesticides_tonnes: pesticidesTonnes,
                avg_temp: weatherData.avgTemp,
            });
            setResult(response.data.predicted_yield);
        } catch (err) {
            setError(t(''));
        }
    };

    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        setError(null);

        try {
            const response = await axios.post('https://krishi-vikas.onrender.com/yield-improvement-chatbot', {
                crop_name: cropName,
                category: category,
                avg_temp: weatherData.avgTemp,
                average_rain_fall_mm_per_year: weatherData.avgRainfall,
                language: localStorage.getItem('languagePreference')
            });

            setChatbotResponse(response.data.response || '');
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(t('errorFetchingDetails'));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await getWeatherData();
            await getYieldPrediction();
            if (selectedCategory) {
                await handleCategoryClick(selectedCategory);
            }
        } catch (err) {
            setError(t('errorFetchingData'));
        }
    };

    return (
        <>
            <Header name={t('Crop Yield Prediction & Chatbot')} />

            <div className="crop-detail-page">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="crop-name">{t('Crop Name')}:</label>
                        <input
                            type="text"
                            id="crop-name"
                            value={cropName}
                            onChange={(e) => setCropName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="pesticides-tonnes">{t('Pesticides (tonnes)')}:</label>
                        <input
                            type="number"
                            id="pesticides-tonnes"
                            value={pesticidesTonnes}
                            onChange={(e) => setPesticidesTonnes(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">{t('Predict Yield')}</button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {result && (
                    <CategoryCard
                        category={t('Predicted Yield')}
                        details={`${t('Predicted Yield')}: ${JSON.stringify(result, null, 2)}`}
                        onClick={(cat) => setSelectedCategory(cat)}
                    />
                )}

                <div className="category-cards">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category}
                            category={category}
                            details={selectedCategory === category ? chatbotResponse : ''}
                            onClick={() => handleCategoryClick(category)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default YieldPrediction;
