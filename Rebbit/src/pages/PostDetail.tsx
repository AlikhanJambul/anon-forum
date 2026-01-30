import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { PostCard } from '../components/post/PostCard';
import { ArrowLeft, Send, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, getAvatarUrl } from '../utils/helpers';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/layout.css';

// ИСПРАВЛЕНИЕ: теперь возвращает undefined вместо null
const getFullImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `http://localhost:8080${url}`; 
};

export const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getPost, addComment, uploadImage } = usePosts();
  
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Получаем пост (или ищем в стейте)
  const post = getPost(id || '');

  // Если пост не найден
  if (!post) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px', color: '#d7dadc' }}>
        <h2>Пост не найден 🕵️‍♂️</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          На главную
        </Link>
      </div>
    );
  }

  // Обработка выбора картинки
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Файл слишком большой (макс 5MB)');
        return;
      }
      setCommentImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setCommentImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // Отправка комментария
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImage) return;

    setIsSubmitting(true);
    try {
      let imageUrl = undefined;
      
      // 1. Загружаем картинку, если есть
      if (commentImage) {
        const url = await uploadImage(commentImage);
        if (url) imageUrl = url;
      }

      // 2. Отправляем комментарий
      await addComment(post.id, commentText, imageUrl);
      
      // 3. Сброс формы
      setCommentText('');
      handleRemoveImage();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      {/* Кнопка назад */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#818384', marginBottom: '15px', textDecoration: 'none' }}>
        <ArrowLeft size={20} />
        Back to posts
      </Link>

      {/* Сам пост (полная версия) */}
      <PostCard post={post} isPreview={false} />

      {/* Секция комментариев */}
      <div style={{ marginTop: '20px', backgroundColor: '#1a1a1b', borderRadius: '8px', padding: '20px', border: '1px solid #343536' }}>
        
        {/* Форма добавления комментария */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
          <div style={{ position: 'relative' }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Оставить комментарий..."
              rows={previewUrl ? 3 : 2}
              style={{
                width: '100%',
                backgroundColor: '#272729',
                border: '1px solid #343536',
                borderRadius: '8px',
                padding: '10px',
                color: '#d7dadc',
                resize: 'vertical',
                minHeight: '60px'
              }}
            />
            
            {/* Превью картинки в поле ввода */}
            {previewUrl && (
              <div style={{ margin: '10px 0', position: 'relative', display: 'inline-block' }}>
                <img src={previewUrl} alt="Preview" style={{ height: '80px', borderRadius: '4px', border: '1px solid #343536' }} />
                <button type="button" onClick={handleRemoveImage} style={{
                  position: 'absolute', top: -5, right: -5, background: 'red', borderRadius: '50%', border: 'none', color: 'white', cursor: 'pointer'
                }}>
                  <X size={12} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              {/* Кнопка загрузки картинки */}
              <label className="icon-btn hover-effect" style={{ cursor: 'pointer', color: '#818384', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ImageIcon size={20} />
                <span style={{ fontSize: '0.9rem' }}>Фото</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </label>

              <button 
                type="submit" 
                disabled={(!commentText.trim() && !commentImage) || isSubmitting}
                className="btn btn-primary"
                style={{ opacity: (!commentText.trim() && !commentImage) ? 0.5 : 1 }}
              >
                {isSubmitting ? '...' : <><Send size={16} style={{ marginRight: '5px' }} /> Комментировать</>}
              </button>
            </div>
          </div>
        </form>

        {/* Список комментариев */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {post.comments && post.comments.length > 0 ? (
            // Сортируем: новые сверху
            [...post.comments].reverse().map(comment => (
              <div key={comment.id} style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', backgroundColor: '#272729' }}>
                {/* Аватарка автора комментария */}
                <img 
                  src={getAvatarUrl(comment.author)} 
                  alt={comment.author}
                  style={{ width: '30px', height: '30px', borderRadius: '50%' }} 
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#d7dadc' }}>{comment.author}</span>
                    <span style={{ fontSize: '0.75rem', color: '#818384' }}>{formatDate(comment.createdAt)}</span>
                  </div>
                  
                  {/* Текст комментария */}
                  <div style={{ color: '#d7dadc', fontSize: '0.95rem', lineHeight: '1.4' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.text}</ReactMarkdown>
                  </div>

                  {/* Картинка комментария */}
                  {comment.imageUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={getFullImageUrl(comment.imageUrl)} 
                        alt="Comment attachment" 
                        style={{ maxHeight: '200px', borderRadius: '4px', maxWidth: '100%' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#818384', padding: '20px' }}>
              Нет комментариев. Будьте первым! 🚀
            </div>
          )}
        </div>
      </div>
    </div>
  );
};