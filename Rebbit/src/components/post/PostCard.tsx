import React, { useState } from 'react';
import type { Post } from '../../types';
import { usePosts } from '../../context/PostContext';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Trash2, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import { ConfirmationModal } from '../common/ConfirmationModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../styles/post.css';
import '../../styles/markdown.css'; // Убедись, что этот файл существует

interface PostCardProps {
  post: Post;
  isPreview?: boolean;
}

// Простая функция для цветов категорий (можно вынести отдельно, но так проще)
const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'Discussion': return '#7193ff';
    case 'Meme': return '#ff4500';
    case 'Tech': return '#2ecc71';
    case 'Question': return '#f1c40f';
    case 'News': return '#e74c3c';
    default: return '#818384';
  }
};

export const PostCard: React.FC<PostCardProps> = ({ post, isPreview = true }) => {
  const { votePost, deletePost } = usePosts();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDeleteModalOpen(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.origin + '/post/' + post.id);
    alert('Ссылка скопирована! 🔗');
  };

  // Для превью обрезаем текст, если он слишком длинный
  const contentToRender = isPreview 
    ? (post.content.length > 300 ? post.content.substring(0, 300) + '...' : post.content)
    : post.content;

  return (
    <>
      <div className="post-card">
        {/* Секция голосования */}
        <div className="vote-section">
          <button className="vote-btn" onClick={() => votePost(post.id, 1)}>
            <ArrowBigUp size={24} />
          </button>
          <span className="vote-count">{post.upvotes}</span>
          <button className="vote-btn" onClick={() => votePost(post.id, -1)}>
            <ArrowBigDown size={24} />
          </button>
        </div>

        {/* Секция контента */}
        <div className="content-section">
          <div className="post-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              
              {/* Плашка категории */}
              {post.category && (
                <span style={{ 
                  backgroundColor: getCategoryColor(post.category), 
                  color: '#000', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.7rem', 
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  {post.category}
                </span>
              )}

              <span>Опубликовал <strong>{post.author}</strong> • {formatDate(post.createdAt)}</span>
            </div>

            <button 
              onClick={handleDeleteClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818384', padding: 0 }}
              title="Удалить пост"
              className="hover-danger"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {isPreview ? (
            <Link to={`/post/${post.id}`}>
              <h3 className="post-title">{post.title}</h3>
              {/* Используем div для Markdown, чтобы избежать ошибок валидации DOM внутри ссылки */}
              <div className="post-text markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {contentToRender}
                </ReactMarkdown>
              </div>
            </Link>
          ) : (
            <>
              <h1 className="post-title" style={{ fontSize: '1.4rem' }}>{post.title}</h1>
              <div className="post-text markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>
            </>
          )}

          <div style={{ marginTop: '12px', display: 'flex', gap: '15px', color: '#818384', fontSize: '0.8rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MessageSquare size={16} /> 
              {post.comments.length} Комментариев
            </div>
            
            <div onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }} className="hover-effect">
              <Share2 size={16} /> 
              Поделиться
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно удаления */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deletePost(post.id)}
        title="Удалить пост?"
        message="Вы уверены, что хотите удалить этот пост? Восстановить его будет невозможно."
      />
    </>
  );
};