import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import '../styles/CategoryCard.css'; // Ensure you have appropriate styles

const CategoryCard = ({ category, details, onClick }) => {
    const { t } = useTranslation(); // Initialize the translation function
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState(null);

    const handleClick = () => {
        setIsExpanded(!isExpanded);
        if (onClick) {
            onClick(category); // Trigger the onClick function passed as a prop
        }
    };

    return (
        <div className={`category-card ${isExpanded ? 'expanded' : ''}`} onClick={handleClick}>
            <h2>{t(category)}</h2> {/* Use the t function to translate the category */}
            {isExpanded && (
                <div className="card-details">
                    {error && <p className="error-message">{t(error)}</p>} {/* Translate the error message */}
                    {details && <p>{t(details)}</p>} {/* Translate the details */}
                </div>
            )}
        </div>
    );
};

export default CategoryCard;
