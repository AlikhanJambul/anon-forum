import React, { useState } from 'react';
import { usePosts } from '../context/PostContext';
import { PostCard } from '../components/post/PostCard';
import { Flame, Clock, TrendingUp, PenSquare } from 'lucide-react';
import '../styles/post.css';

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
  
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [sortBy, setSortBy] = useState<SortType>('new');
  const [errors, setErrors] = useState({ title: false, content: false });

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'top' || sortBy === 'hot') return b.upvotes - a.upvotes;
    return 0;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      title: !title.trim(),
      content: !content.trim()
    };
    setErrors(newErrors);

    if (newErrors.title || newErrors.content) return;
    
    addPost(title, content, category);
    
    setTitle('');
    setContent('');
    setCategory(CATEGORIES[0].id);
    setIsCreating(false);
    setErrors({ title: false, content: false });
  };

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
      {/* ЕДИНАЯ ФОРМА (чтобы не терялся фокус при вводе) */}
      <form onSubmit={handleSubmit} className="create-form" style={{ position: 'relative' }}>
        
        {/* Верхняя часть с заголовком (Видна всегда) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isCreating ? '15px' : '0' }}>
           {!isCreating && (
             <div style={{ background: '#343536', borderRadius: '50%', padding: '8px', flexShrink: 0 }}>
                <PenSquare size={24} />
             </div>
           )}
           
           <input 
             className={`input-field ${errors.title ? 'input-error' : ''}`} 
             placeholder="Заголовок" 
             value={title} 
             onFocus={() => setIsCreating(true)} 
             onChange={e => {
               setTitle(e.target.value);
               if (errors.title) setErrors(prev => ({ ...prev, title: false })); 
             }}
             style={{ width: '100%' }}
           />
        </div>

        {/* Раскрывающаяся часть (Категории, Текст, Кнопки) */}
        {isCreating && (
          <div className="expandable-content">
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
                     transition: 'all 0.2s',
                     whiteSpace: 'nowrap'
                   }}
                 >
                   {cat.label}
                 </button>
               ))}
             </div>

             <textarea 
               className={`input-field ${errors.content ? 'input-error' : ''}`} 
               placeholder="Текст (Markdown поддерживается!)" 
               value={content} 
               onChange={e => {
                 setContent(e.target.value);
                 if (errors.content) setErrors(prev => ({ ...prev, content: false }));
               }}
               style={{ minHeight: '120px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
               autoFocus 
             />

             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
               <button 
                 type="button" 
                 className="btn-primary" 
                 style={{ background: 'transparent', color: '#fff', border: '1px solid #343536' }} 
                 onClick={() => {
                   setIsCreating(false);
                   setErrors({ title: false, content: false });
                 }}
               >
                 Отмена
               </button>
               <button type="submit" className="btn-primary">Опубликовать</button>
             </div>
          </div>
        )}
      </form>

      {/* Панель сортировки */}
      <div style={{ marginBottom: '15px', marginTop: '20px', display: 'flex', alignItems: 'center' }}>
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
          sortedPosts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#818384' }}>
            Здесь пока пусто... Станьте первым! 👻
          </div>
        )}
      </div>
    </div>
  );
};