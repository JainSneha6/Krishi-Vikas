import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import '../styles/MarketTrend.css';
import Header from '../components/Header';

ChartJS.register(LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, annotationPlugin);

const MarketTrendsPage = () => {
  const { t, i18n } = useTranslation();
  const [crop, setCrop] = useState('');
  const [marketData, setMarketData] = useState({
    labels: [],
    datasets: [
      {
        label: t('market_trends'),
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        pointBackgroundColor: function(context) {
          return context.raw === Math.max(...context.dataset.data) ? 'green' :
                 context.raw === Math.min(...context.dataset.data) ? 'red' : 'rgba(75, 192, 192, 1)';
        }
      }
    ]
  });
  const [hoveredData, setHoveredData] = useState(null);

  useEffect(() => {
    const storedLang = localStorage.getItem('languagePreference') || 'en';
    console.log(storedLang)
    i18n.changeLanguage(storedLang);
  }, []);

  const dummyData = {
    apple: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [130, 140, 150, 160, 155, 165],
    },
    maize: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [90, 95, 100, 110, 105, 115],
    },
    rice: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [50, 60, 55, 70, 65, 75],
    },
    mango: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [200, 193, 178, 186, 162, 151],
    }
  };

  const fetchMarketData = (cropName) => {
    const cropData = dummyData[cropName.toLowerCase()];
    
    if (cropData) {
      setMarketData({
        labels: cropData.labels,
        datasets: [{
          label: `${t('market_trends')} ${cropName.charAt(0).toUpperCase() + cropName.slice(1)} (₹/kg)`,
          data: cropData.data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
          pointBackgroundColor: cropData.data.map((price, index, arr) =>
            price === Math.max(...arr) ? 'green' : price === Math.min(...arr) ? 'red' : 'rgba(75, 192, 192, 1)'
          )
        }]
      });
    } else {
      alert(t('crop_data_not_available'));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchMarketData(crop);
  };

  const handlePointHover = (event, elements) => {
    if (elements.length > 0) {
      const { index } = elements[0];
      setHoveredData({
        month: marketData.labels[index],
        price: marketData.datasets[0].data[index],
      });
    } else {
      setHoveredData(null);
    }
  };

  return (
    <>
    <Header name={t('market_trends')}/>
    <div className='market-trends-page'>
      <form onSubmit={handleSubmit} className='crop-form'>
        <input
          type="text"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          placeholder={t('enter_crop')}
          required
          className='crop-input'
        />
        <button type="submit" className='crop-submit-button'>{t('show_trends')}</button>
      </form>
      <div className='content-container'>
        <div className='chart-container'>
          <Line
            data={marketData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    color: 'black',
                    font: {
                      size: 12,
                    },
                  },
                },
                tooltip: {
                  enabled: false,
                },
                annotation: {
                  annotations: [
                    {
                      type: 'line',
                      scaleID: 'y',
                      value: Math.max(...marketData.datasets[0].data),
                      borderColor: 'green',
                      borderWidth: 2,
                      label: {
                        content: t('highest_price'),
                        enabled: true,
                        position: 'start'
                      }
                    },
                    {
                      type: 'line',
                      scaleID: 'y',
                      value: Math.min(...marketData.datasets[0].data),
                      borderColor: 'red',
                      borderWidth: 2,
                      label: {
                        content: t('lowest_price'),
                        enabled: true,
                        position: 'start'
                      }
                    }
                  ]
                }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Time'
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Market Price (₹/kg)'
                  }
                }
              },
              onHover: (event, elements) => handlePointHover(event, elements),
            }}
          />
        </div>
        <div className='side-box'>
          {hoveredData ? (
            <div>
              <h3>{t('price_details')}</h3>
              <p><strong>{t('month')}:</strong> {hoveredData.month}</p>
              <p><strong>{t('price')}:</strong> ₹{hoveredData.price}/kg</p>
            </div>
          ) : (
            <p>{t('hover_to_see_details')}</p>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default MarketTrendsPage;
