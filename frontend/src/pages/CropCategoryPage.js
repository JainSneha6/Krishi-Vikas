import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CropDetailCard from '../components/CropDetailCard';
import { useTranslation } from 'react-i18next';
import '../styles/CropCategoryPage.css';
import Header from '../components/Header';
import axios from 'axios';

const CropCategoryPage = () => {
    const { category } = useParams();
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState(null);
    const { t } = useTranslation(); // Initialize the translation function

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await axios.post('http://localhost:5000/recommendations', {
                    latitude: localStorage.getItem('latitude'),
                    longitude: localStorage.getItem('longitude'),
                    category,
                    language: localStorage.getItem('languagePreference') || 'en'
                });
                setRecommendations(response.data.Recommendations);
                setError(null);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
                setError(t('errorFetchingRecommendations')); // Translate the error message
            }
        };

        fetchRecommendations();
    }, [category]);

    return (
        <>
            <Header name={t('Crop Recommendations')}/> {/* Translate the header name */}
            <div className="crop-category-page">
                {error && <p className="error">{t(error)}</p>} {/* Translate the error message */}
                <ul>
                    {recommendations.map((rec, index) => (
                        <CropDetailCard
                            key={index}
                            name={t(rec.name)} // Translate the name
                            ename={rec.ename}
                            description={t(rec.description)} // Translate the description
                            image={rec.image}
                        />
                    ))}
                </ul>
            </div>
        </>
    );
};

export default CropCategoryPage;
