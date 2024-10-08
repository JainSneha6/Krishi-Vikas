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
    const [loading, setLoading] = useState(true);  // New loading state
    const [error, setError] = useState(null);
    const { t } = useTranslation(); 

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);  // Set loading to true when fetching starts
            try {
                const response = await axios.post('https://krishi-vikas.onrender.com/recommendations', {
                    latitude: localStorage.getItem('latitude'),
                    longitude: localStorage.getItem('longitude'),
                    category,
                    language: localStorage.getItem('languagePreference') || 'en'
                });
                setRecommendations(response.data.Recommendations);
                setError(null);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
                setError(t('errorFetchingRecommendations')); 
            } finally {
                setLoading(false);  // Set loading to false when fetching ends
            }
        };

        fetchRecommendations();
    }, [category]);

    return (
        <>
            <Header name={t('Crop Recommendations')}/> 
            <div className="crop-category-page">
                {loading && <p>{t('Loading...')}</p>} {/* Show loading text while fetching */}
                {error && <p className="error">{t(error)}</p>} 
                <ul>
                    {recommendations.map((rec, index) => (
                        <CropDetailCard
                            key={index}
                            name={t(rec.name)} 
                            ename={rec.ename}
                            description={t(rec.description)} 
                            image={rec.image}
                        />
                    ))}
                </ul>
            </div>
        </>
    );
};

export default CropCategoryPage;
