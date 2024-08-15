import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import '../styles/Posts.css'; // Import your CSS file

const Posts = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);

  const names = ['Raju', 'Krishna', 'Ram', 'Amit', 'Dev'];

  useEffect(() => {
    // Load language preference from localStorage
    const storedLang = localStorage.getItem('languagePreference') || 'en';
    i18n.changeLanguage(storedLang);

    axios.get('http://localhost:5000/api/posts')
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the posts!", error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    if (media) {
      formData.append('media', media);
    }

    axios.post('http://localhost:5000/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        setContent('');
        setMedia(null);
        return axios.get('http://localhost:5000/api/posts');
      })
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error("There was an error creating the post!", error);
      });
  };

  return (
    <>
      <Header name={t('Posts')} />
      <div className='crop-detail-page'>
        <form onSubmit={handleSubmit} className='post-form'>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder={t('Content')} 
            required 
            className='post-textarea'
          />
          <input 
            type="file" 
            onChange={(e) => setMedia(e.target.files[0])} 
            className='post-file-input'
          />
          <button type="submit" className='post-submit-button'>{t('Submit')}</button>
        </form>
        <ul className='posts-list'>
          {posts.map(post => (
            <li key={post.id} className='post-item'>
              <p className='post-author'>{names[(post.id - 1) % names.length]}</p>
              <pre className='post-content'>{post.content}</pre>
              {post.media_url && (
                post.media_url.endsWith('.mp4') ? (
                  <video controls src={`http://localhost:5000/uploads/${post.media_url}`} className='post-media' />
                ) : (
                  <img src={`http://localhost:5000/uploads/${post.media_url}`} alt={t('media_alt_text')} className='post-media' />
                )
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Posts;
