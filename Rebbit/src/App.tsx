import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PostProvider } from './context/PostContext';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { PostDetail } from './pages/PostDetail';
import { Toaster } from 'react-hot-toast'; 

// Импорт глобальных стилей
import './styles/theme.css';
import './styles/layout.css';
import './styles/markdown.css';

function App() {
  return (
    <PostProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/post/:id" element={<PostDetail />} />
            </Routes>
          </main>
        </div>
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}/>
      </Router>
    </PostProvider>
  );
}

export default App;