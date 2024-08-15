import React, { useState } from 'react';
import axios from 'axios'; // Import Axios for making HTTP requests
import { useTranslation } from 'react-i18next';
import CategoryCard from '../components/CategoryCard';
import '../styles/CropDetailPage.css';
import Header from '../components/Header';

const CropDetailPage = () => {
    const { t } = useTranslation();

    const category = [
        t('Site Selection and Preparation'), t('Seed Selection'), t('Planting'),
        t('Water Management'), t('Nutrient Management'), t('Pest and Disease Management'),
        t('Weed Control'), t('Crop Maintenance'), t('Harvesting'), t('Post-Harvest Handling')
    ];

    const [cropName] = useState(window.location.pathname.split('/').pop()); // Extract crop name from URL
    const [responseDetails, setResponseDetails] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/crop_steps', {
                crop_name: cropName,
                language: localStorage.getItem('languagePreference') || 'en',
                category: category
            });

            setResponseDetails(prevDetails => ({
                ...prevDetails,
                [category]: response.data
            }));
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(t('Failed to fetch details. Please try again later.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header name={t('Growing Steps')} />

            <div className="crop-detail-page">
                {loading && <p>{t('Loading...')}</p>}
                {error && <p className="error-message">{t(error)}</p>}
                <div>
                    {category.map(cat => (
                        <CategoryCard
                            key={cat}
                            category={cat}
                            details={responseDetails[cat] || (selectedCategory === cat ? t('Loading...') : '')} // Show details if the category is selected
                            onClick={() => handleCategoryClick(cat)} // Pass onClick handler
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default CropDetailPage;
