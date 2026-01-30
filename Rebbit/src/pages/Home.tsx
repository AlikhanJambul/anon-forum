import React, { useState } from 'react';
import { usePosts } from '../context/PostContext';
import { PostCard } from '../components/post/PostCard';
import { Flame, Clock, TrendingUp, PenSquare, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
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
  const { posts, addPost, uploadImage } = usePosts();
  
  // Состояния формы
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [sortBy, setSortBy] = useState<SortType>('new');
  
  // Состояния для фото
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- НОВОЕ: Состояние для ошибок (чтобы трясти поля) ---
  const [errors, setErrors] = useState({ title: false, content: false });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Файл слишком большой (макс 5MB)');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- ПРОВЕРКА НА ПУСТЫЕ ПОЛЯ ---
    const newErrors = {
      title: !title.trim(),
      content: !content.trim()
    };

    if (newErrors.title || newErrors.content) {
      setErrors(newErrors);
      // Если есть ошибки, прерываем отправку
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = undefined;
      if (selectedFile) {
        const url = await uploadImage(selectedFile);
        if (url) imageUrl = url;
      }

      await addPost(title, content, category, imageUrl);
      
      // Сброс формы
      setTitle('');
      setContent('');
      setCategory(CATEGORIES[0].id);
      handleRemoveImage();
      setIsCreating(false);
      setErrors({ title: false, content: false }); // Сбрасываем ошибки
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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
            // Добавляем класс input-error если errors.title === true
            className={`input-field ${errors.title ? 'input-error' : ''}`} 
            placeholder="Заголовок" 
            value={title} 
            onChange={e => {
              setTitle(e.target.value);
              // Убираем красную обводку, когда пользователь начинает писать
              if (errors.title) setErrors(prev => ({ ...prev, title: false }));
            }}
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
            // Добавляем класс input-error если errors.content === true
            className={`input-field ${errors.content ? 'input-error' : ''}`} 
            placeholder="Текст (Markdown поддерживается!)" 
            value={content} 
            onChange={e => {
              setContent(e.target.value);
              // Убираем красную обводку при вводе
              if (errors.content) setErrors(prev => ({ ...prev, content: false }));
            }}
            style={{ minHeight: '120px', resize: 'vertical' }}
          />

          {/* ПРЕДПРОСМОТР КАРТИНКИ */}
          {previewUrl && (
            <div style={{ marginBottom: '15px', position: 'relative', display: 'inline-block' }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid #343536' }} 
              />
              <button 
                type="button"
                onClick={handleRemoveImage}
                style={{
                  position: 'absolute', top: '5px', right: '5px',
                  background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                  color: 'white', cursor: 'pointer', padding: '4px', display: 'flex'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            
            {/* Кнопка загрузки картинки */}
            <label 
              style={{ 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', 
                color: '#818384', padding: '5px', borderRadius: '5px' 
              }}
              className="hover-effect"
            >
              <ImageIcon size={20} />
              <span style={{ fontSize: '0.9rem' }}>Фото</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ background: 'transparent', color: '#fff', border: '1px solid #fff' }} 
                onClick={() => {
                  setIsCreating(false);
                  setErrors({ title: false, content: false }); // Сбрасываем ошибки при отмене
                }}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Публикация...' : 'Опубликовать'}
              </button>
            </div>
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