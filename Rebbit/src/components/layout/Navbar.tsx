import { Link } from 'react-router-dom';
import { Ghost, Search } from 'lucide-react'; // Добавили Search
import { usePosts } from '../../context/PostContext'; // Импортируем хук
import '../../styles/layout.css';

export const Navbar = () => {
  const { searchQuery, setSearchQuery } = usePosts(); // Достаем функции

  return (
    <nav className="navbar" style={{ justifyContent: 'space-between' }}>
      <Link to="/" className="brand">
        <Ghost color="#ff4500" />
        <span className="brand-text">Rebbit</span>
      </Link>

      {/* Поле поиска */}
      <div style={{ 
        flex: 1, 
        maxWidth: '500px', 
        margin: '0 20px', 
        position: 'relative' 
      }}>
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: '#272729',
            border: '1px solid #343536',
            borderRadius: '20px',
            padding: '8px 12px 8px 40px', // Отступ слева под иконку
            color: '#d7dadc',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />
      </div>

      {/* Правая часть (пока пустая, или можно добавить кнопку профиля) */}
      <div style={{ width: '24px' }}></div> 
    </nav>
  );
};