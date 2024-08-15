import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import '../styles/CropCalendar.css';
import Header from '../components/Header';

const CropCalendar = () => {
  const { t, i18n } = useTranslation(); // Use i18n for language changing
  const [calendarEntries, setCalendarEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ date: new Date(), crop: '', task: '' });

  useEffect(() => {
    // Get the language preference from localStorage
    const storedLang = localStorage.getItem('languagePreference') || 'en';
    i18n.changeLanguage(storedLang);

    fetchCalendarEntries();
  }, []);

  const fetchCalendarEntries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/calendar');
      setCalendarEntries(response.data);
    } catch (error) {
      console.error('Error fetching calendar entries', error);
    }
  };

  const handleDateChange = (date) => {
    setNewEntry({ ...newEntry, date });
  };

  const handleCropChange = (e) => {
    setNewEntry({ ...newEntry, crop: e.target.value });
  };

  const handleTaskChange = (e) => {
    setNewEntry({ ...newEntry, task: e.target.value });
  };

  const handleAddEntry = async () => {
    try {
      await axios.post('http://localhost:5000/calendar', newEntry);
      fetchCalendarEntries();
      setNewEntry({ date: new Date(), crop: '', task: '' });
    } catch (error) {
      console.error('Error adding entry', error);
    }
  };

  const handleDeleteEntry = async (index) => {
    try {
      await axios.delete(`http://localhost:5000/calendar/${index}`);
      fetchCalendarEntries();
    } catch (error) {
      console.error('Error deleting entry', error);
    }
  };

  return (
    <>
    <Header name={t('Crop Calendar')} />
    <div className="crop-calendar">
      <div className="form">
        <DatePicker selected={newEntry.date} onChange={handleDateChange} />
        <input
          type="text"
          value={newEntry.crop}
          onChange={handleCropChange}
          placeholder={t('Crop Name')}
        />
        <input
          type="text"
          value={newEntry.task}
          onChange={handleTaskChange}
          placeholder={t('Task')}
        />
        <button onClick={handleAddEntry}>{t('Add Entry')}</button>
      </div>
      <ul>
        {calendarEntries.map((entry, index) => (
          <li key={index}>
            {`${new Date(entry.date).toLocaleDateString()} - ${entry.crop} - ${entry.task}`}
            <button onClick={() => handleDeleteEntry(index)}>{t('Delete')}</button>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
};

export default CropCalendar;
