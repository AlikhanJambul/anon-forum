import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ghost, Search } from 'lucide-react';
import { usePosts } from '../../context/PostContext';
import type { Post } from '../../types';
import '../../styles/layout.css';

export const Navbar = () => {
  // Логика поиска
  const { searchPosts } = usePosts();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 1. Эффект для "живого" поиска (Debounce)
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length > 0) {
        // Вызываем функцию поиска из контекста
        const found = await searchPosts(query);
        setResults(found);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    };

    // Задержка 300мс, чтобы не спамить сервер
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, searchPosts]);

  // 2. Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Переход к посту при клике
  const handleResultClick = (postId: string) => {
    setQuery(''); // Очищаем поле
    setShowResults(false);
    navigate(`/post/${postId}`);
  };

  return (
    <nav className="navbar" style={{ justifyContent: 'space-between' }}>
      {/* Логотип */}
      <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <Ghost color="#ff4500" />
        <span className="brand-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d7dadc' }}>Rebbit</span>
      </Link>

      {/* Поле поиска + Выпадающий список */}
      <div 
        ref={searchRef}
        style={{ 
          flex: 1, 
          maxWidth: '500px', 
          margin: '0 20px', 
          position: 'relative' 
        }}
      >
        <div style={{ 
          position: 'absolute', 
          left: '12px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: '#818384'
        }}>
          <Search size={18} />
        </div>
        
        <input 
          type="text"
          placeholder="Поиск..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowResults(true); }}
          style={{
            width: '100%',
            background: '#272729',
            border: '1px solid #343536',
            borderRadius: '20px',
            padding: '8px 12px 8px 40px',
            color: '#d7dadc',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />

        {/* Выпадающее меню с результатами (Стилизовано под темную тему) */}
        {showResults && results.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '110%', // Чуть ниже инпута
            left: 0,
            right: 0,
            backgroundColor: '#272729',
            border: '1px solid #343536',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {results.map(post => (
              <div 
                key={post.id}
                onClick={() => handleResultClick(post.id)}
                style={{
                  padding: '12px 15px',
                  borderBottom: '1px solid #343536',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#343536'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#d7dadc' }}>
                  {post.title}
                </span>
                <span style={{ fontSize: '12px', color: '#818384', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {post.content.substring(0, 50)}...
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Правая часть */}
      <div style={{ width: '24px' }}></div> 
    </nav>
  );
};