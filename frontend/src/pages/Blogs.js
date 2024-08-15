import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/Blogs.css'; // Import your CSS file
import Header from '../components/Header';

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    // Load language preference from localStorage
    const storedLang = localStorage.getItem('languagePreference') || 'en';
    i18n.changeLanguage(storedLang);

    axios.get('http://localhost:5000/api/blogs')
      .then(response => {
        setBlogs(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the blogs!", error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/blogs', { title, content, author })
      .then(response => {
        setBlogs([...blogs, response.data]);
        setTitle('');
        setContent('');
        setAuthor('');
      })
      .catch(error => {
        console.error("There was an error creating the blog!", error);
      });
  };

  return (
    <>
    <Header name={t('Blogs')} />
    <div className='blog-page'>
      <form onSubmit={handleSubmit} className='blog-form'>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder={t('Title')} 
          required 
          className='blog-input'
        />
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder={t('Content')} 
          required 
          className='blog-textarea'
        />
        <input 
          type="text" 
          value={author} 
          onChange={(e) => setAuthor(e.target.value)} 
          placeholder={t('Author')} 
          required 
          className='blog-input'
        />
        <button type="submit" className='blog-submit-button'>{t('Submit')}</button>
      </form>
      <ul className='blogs-list'>
        {blogs.map(blog => (
          <li key={blog.id} className='blog-item'>
            <h2 className='blog-title'>{blog.title}</h2>
            <p className='blog-author'>{t('By')}: {blog.author}</p>
            <p className='blog-content'>{blog.content}</p>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
};

export default BlogPage;
