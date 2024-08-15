import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home'
import Sidebar from './components/Sidebar';
import CropRecommendation from './pages/CropRecommendation';
import CropCategoryPage from './pages/CropCategoryPage';
import CropDetailPage from './pages/CropDetailPage';
import Chatbot from './pages/Chatbot';
import YieldPrediction from './pages/YieldPrediction';
import PestChatbot from './pages/PestChatbot';
import Posts from './pages/Posts';
import ExpertChatbot from './pages/ExpertChatbot';
import Blogs from './pages/Blogs'
import MarketTrendsPage from './pages/MarketTrend';
import CropCalendar from './pages/CropCalendar';

function App() {
  return (
      <Router>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/recommendations" element={<CropRecommendation />} />
          <Route path="/crop/:category" element={<CropCategoryPage />} />
          <Route path="/crop-detail/:name" element={<CropDetailPage />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/yield-prediction" element={<YieldPrediction />} />
          <Route path="/pest-chatbot" element={<PestChatbot />} />
          <Route path='/expert-chatbot' element={<ExpertChatbot/>} />
          <Route path='/market-trends' element={<MarketTrendsPage/>}/>
          <Route path='/posts' element={<Posts/>} />
          <Route path='/blogs' element={<Blogs/>} />
          <Route path='/crop-calendar' element={<CropCalendar/>} />
        </Routes>
      </Router>
  );
}

export default App;
