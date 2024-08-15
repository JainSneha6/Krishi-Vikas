import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';

const Chatbot = () => {
  const { t, i18n } = useTranslation(); // Initialize translation and i18n
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Set language based on localStorage
  useEffect(() => {
    const language = localStorage.getItem('languagePreference') || 'en';
    i18n.changeLanguage(language).catch(err => console.error(`Error changing language: ${err}`));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMessage = { text: query, type: 'user' };
    setMessages([...messages, newMessage]);
    setLoading(true);

    axios.post('http://localhost:5000/chatbot-expert', { query, language: localStorage.getItem('languagePreference') })
      .then(response => {
        const botMessage = { text: response.data.response, type: 'bot' };
        setMessages([...messages, newMessage, botMessage]);
        setQuery('');
        setLoading(false);
      })
      .catch(error => {
        console.error("There was an error with the chatbot request!", error);
        setLoading(false);
      });
  };

  return (
    <>
      <Header name={t('ExpertBot')} />
      <div className='chatbot-container'>
        <div className='chatbox'>
          <div className='chatbox-messages'>
            {messages.map((msg, index) => (
              <div key={index} className={`chatbox-message ${msg.type}`}>
                <p style={{fontSize:'20px', paddingLeft:'20px', paddingTop:'8px'}}>{msg.text}</p>
              </div>
            ))}
            {loading && <div className='chatbox-message bot'><p>{t('sending')}</p></div>}
          </div>
          <form onSubmit={handleSubmit} className='chatbox-input'>
            <textarea 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder={t('typeYourMessage')} 
              required 
            />
            <button type="submit" disabled={loading}>
              {loading ? t('sending') : t('send')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
