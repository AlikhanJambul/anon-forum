import React, { useState } from 'react';
import { usePosts } from '../context/PostContext';
import { PostCard } from '../components/post/PostCard';
import { Flame, Clock, TrendingUp, PenSquare } from 'lucide-react';
import '../styles/post.css';

// Конфигурация категорий
const CATEGORIES = [
  { id: 'Discussion', label: 'Обсуждение', color: '#7193ff' },
  { id: 'Meme', label: 'Мем', color: '#ff4500' },
  { id: 'Tech', label: 'IT', color: '#2ecc71' },
  { id: 'Question', label: 'Вопрос', color: '#f1c40f' },
  { id: 'News', label: 'Новости', color: '#e74c3c' },
];

type SortType = 'new' | 'top' | 'hot';

export const Home = () => {
  const { posts, addPost } = usePosts();
  
  // Состояния
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id); // Выбранная категория
  const [sortBy, setSortBy] = useState<SortType>('new');

  // Логика сортировки
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'new') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'top') {
      return b.upvotes - a.upvotes;
    }
    if (sortBy === 'hot') {
      return b.upvotes - a.upvotes; 
    }
    return 0;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    // Передаем 3 параметра: заголовок, текст, категория
    addPost(title, content, category);
    
    // Сброс формы
    setTitle('');
    setContent('');
    setCategory(CATEGORIES[0].id);
    setIsCreating(false);
  };

  // Стили для кнопок сортировки
  const sortBtnStyle = (type: SortType) => ({
    background: sortBy === type ? '#272729' : 'transparent',
    border: 'none',
    color: sortBy === type ? '#d7dadc' : '#818384',
    padding: '8px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginRight: '8px'
  });

  return (
    <div>
      {/* Форма создания поста */}
      {!isCreating ? (
        <div className="create-form" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{ background: '#343536', borderRadius: '50%', padding: '8px' }}>
              <PenSquare size={24} />
           </div>
           <input 
             className="input-field" 
             style={{ margin: 0, cursor: 'text' }}
             placeholder="Создать анонимный пост..." 
             onClick={() => setIsCreating(true)}
             readOnly
           />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="create-form">
          <input 
            className="input-field" 
            placeholder="Заголовок" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            autoFocus 
          />

          {/* Выбор категории */}
          <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                style={{
                  background: category === cat.id ? cat.color : '#272729',
                  color: category === cat.id ? '#000' : '#818384',
                  border: category === cat.id ? `1px solid ${cat.color}` : '1px solid #343536',
                  borderRadius: '15px',
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <textarea 
            className="input-field" 
            placeholder="Текст (Markdown поддерживается!)" 
            value={content} 
            onChange={e => setContent(e.target.value)}
            style={{ minHeight: '120px', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-primary" style={{ background: 'transparent', color: '#fff', border: '1px solid #fff' }} onClick={() => setIsCreating(false)}>
              Отмена
            </button>
            <button type="submit" className="btn-primary">Опубликовать</button>
          </div>
        </form>
      )}

      {/* Панель сортировки */}
      <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => setSortBy('hot')} style={sortBtnStyle('hot')}>
           <Flame size={18} /> Hot
        </button>
        <button onClick={() => setSortBy('new')} style={sortBtnStyle('new')}>
           <Clock size={18} /> New
        </button>
        <button onClick={() => setSortBy('top')} style={sortBtnStyle('top')}>
           <TrendingUp size={18} /> Top
        </button>
      </div>

      {/* Лента постов */}
      <div className="feed">
        {sortedPosts.length > 0 ? (
          sortedPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#818384' }}>
            Здесь пока пусто... Станьте первым! 👻
          </div>
        )}
      </div>
    </div>
  );
};