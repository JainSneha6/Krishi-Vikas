import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import CategoryCard from '../components/CategoryCard';
import Header from '../components/Header';

const Chatbot = () => {
    const { t, i18n } = useTranslation(); // Initialize the translation function
    const [query, setQuery] = useState('');
    const [cropName, setCropName] = useState('');
    const [responseDetails, setResponseDetails] = useState(''); // State for details
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState(localStorage.getItem('languagePreference') || 'en');

    useEffect(() => {
        i18n.changeLanguage(language).catch(err => setError(t('errorChangingLanguage', { err: err.message })));
    }, [language]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            if (query) {
                // Call the chatbot route if the query is provided
                const response = await axios.post('http://localhost:5000/chatbot', {
                    query: query,
                    crop_name: cropName,
                    language: language,
                });

                setResponseDetails(response.data.response || ''); // Set details for CategoryCard
            } else {
                setError(t('Please provide a query.')); // Translate the error message
            }
        } catch (err) {
            console.error('Error fetching response:', err);
            setError(t('Failed to fetch details. Please try again later.')); // Translate the error message
        }
    };

    return (
        <>
            <Header name={t('Crop Management Chatbot')} /> {/* Translate the header name */}
            <div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="query">{t('Your Query')}</label> {/* Translate the label */}
                        <input
                            type="text"
                            id="query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="cropName">{t('Crop Name')}</label> {/* Translate the label */}
                        <input
                            type="text"
                            id="cropName"
                            value={cropName}
                            onChange={(e) => setCropName(e.target.value)}
                        />
                    </div>
                    <button type="submit">{t('Send')}</button> {/* Translate the button text */}
                </form>
                <div className="crop-detail-page">
                    {error && <p className="error-message">{error}</p>} {/* Display the error message */}
                    <CategoryCard
                        category={t('Response')}
                        cropName={cropName}
                        query={query}
                        details={responseDetails} 
                    />
                </div>
            </div>
        </>
    );
};

export default Chatbot;
