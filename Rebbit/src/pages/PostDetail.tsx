import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { PostCard } from '../components/post/PostCard';
import { formatDate } from '../utils/helpers';
import { ArrowLeft, User, Send } from 'lucide-react';
// Импортируем Markdown и стили
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/post.css';

export const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPost, addComment } = usePosts();
  const [comment, setComment] = useState('');

  const post = getPost(id || '');

  if (!post) return (
    <div style={{ textAlign: 'center', marginTop: 50, color: '#818384' }}>
      Пост исчез в пустоте... <br/>
      <Link to="/" style={{ color: '#d7dadc', textDecoration: 'underline' }}>Вернуться домой</Link>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment(post.id, comment);
    setComment('');
  };

  return (
    <div>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: '#d7dadc', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px', cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={20} />
        Назад
      </button>

      <PostCard post={post} isPreview={false} />

      <div style={{ background: '#1a1a1b', borderRadius: '4px', border: '1px solid #343536', marginTop: '20px', padding: '20px' }}>
        
        <div style={{ marginBottom: '20px' }}>
            Всего комментариев: {post.comments.length}
        </div>

        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
          <textarea 
            className="input-field" 
            placeholder="Оставьте свои мысли (Markdown поддерживается!)..." 
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ minHeight: '100px', paddingRight: '50px' }} 
          />
          <button 
            type="submit" 
            style={{ position: 'absolute', bottom: '20px', right: '10px', background: '#d7dadc', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Отправить"
          >
            <Send size={16} color="#000" />
          </button>
        </form>

        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {post.comments.length > 0 ? post.comments.map(c => (
                <div key={c.id} style={{ padding: '10px', background: '#161617', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ background: '#343536', borderRadius: '50%', padding: '4px' }}>
                             <User size={14} color="#818384" />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#d7dadc', fontWeight: 'bold' }}>{c.author}</span>
                        <span style={{ fontSize: '0.8rem', color: '#818384' }}>• {formatDate(c.createdAt)}</span>
                    </div>
                    {/* ВОТ ЗДЕСЬ ИЗМЕНЕНИЕ: Оборачиваем текст в Markdown */}
                    <div className="markdown-content" style={{ paddingLeft: '28px', color: '#d7dadc' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {c.text}
                      </ReactMarkdown>
                    </div>
                </div>
            )) : (
              <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#818384' }}>
                 Пока тишина...
              </div>
            )}
        </div>
      </div>
    </div>
  );
};