import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PostProvider } from './context/PostContext';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { PostDetail } from './pages/PostDetail';

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
      </Router>
    </PostProvider>
  );
}

export default App;