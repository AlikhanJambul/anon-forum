import React, { useState, useEffect, useRef } from 'react';
import type { Post } from '../../types';
import { usePosts } from '../../context/PostContext';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Trash2, 
  Share2,
  Copy,
  Send,
  MessageCircle,
  Twitter,
  PenLine, // <-- Иконка редактирования
  Save,    // <-- Иконка сохранения
  X        // <-- Иконка отмены
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // <-- Импорт тостов
import { formatDate, getAvatarUrl } from '../../utils/helpers'; // <-- Импорт хелпера аватарок
import { ConfirmationModal } from '../common/ConfirmationModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../styles/post.css';
import '../../styles/markdown.css';

interface PostCardProps {
  post: Post;
  isPreview?: boolean;
}

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
  // Достаем updatePost из контекста
  const { votePost, deletePost, updatePost } = usePosts(); 
  
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // --- Состояния для редактирования ---
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  // ------------------------------------

  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Синхронизируем состояние редактирования при изменении пропса post
  useEffect(() => {
    setEditTitle(post.title);
    setEditContent(post.content);
  }, [post]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDeleteModalOpen(true);
  };

  // Включение режима редактирования
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
    setShowShareMenu(false); // Закрываем меню шаринга, если открыто
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(post.title); // Сбрасываем к исходным значениям
    setEditContent(post.content);
  };

  // Сохранение изменений
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
       toast.error("Заголовок и текст не могут быть пустыми");
       return;
    }
    await updatePost(post.id, editTitle, editContent);
    setIsEditing(false);
  };

  const shareUrl = `${window.location.origin}/post/${post.id}`;
  const shareText = `Зацени пост: ${post.title}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowShareMenu(false);
    toast.success('Ссылка скопирована в буфер! 🔗'); // <-- Красивый тост вместо alert
  };

  const handleSocialShare = (platform: 'telegram' | 'whatsapp' | 'twitter') => {
    let url = '';
    switch (platform) {
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
    }
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const safeContent = String(post.content || '');
  const contentToRender = isPreview
    ? (safeContent.length > 300 ? safeContent.substring(0, 300) + '...' : safeContent)
    : safeContent;

  return (
    <>
      <div className="post-card">
        <div className="vote-section">
          <button className="vote-btn" onClick={() => votePost(post.id, 1)}><ArrowBigUp size={24} /></button>
          <span className="vote-count">{post.upvotes}</span>
          <button className="vote-btn" onClick={() => votePost(post.id, -1)}><ArrowBigDown size={24} /></button>
        </div>

        <div className="content-section">
          {/* Верхняя панель с метой и кнопками действий */}
          <div className="post-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              
              {/* АВАТАРКА */}
              <img 
                src={getAvatarUrl(post.author)} 
                alt={post.author}
                style={{ width: '24px', height: '24px', borderRadius: '50%' }} 
              />

              {post.category && (
                <span style={{
                  backgroundColor: getCategoryColor(post.category),
                  color: '#000', padding: '2px 8px', borderRadius: '12px',
                  fontSize: '0.7rem', fontWeight: 'bold', display: 'inline-block'
                }}>{post.category}</span>
              )}
              <span>Is <strong>{post.author}</strong> • {formatDate(post.createdAt)}</span>
            </div>

            {/* Кнопки Редактировать и Удалить (показываем только если не в режиме редактирования) */}
            {!isEditing && (
              <div style={{ display: 'flex', gap: '8px' }}>
                 <button onClick={handleEditClick} className="icon-btn hover-primary" title="Редактировать">
                  <PenLine size={16} />
                </button>
                <button onClick={handleDeleteClick} className="icon-btn hover-danger" title="Удалить">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* УСЛОВНЫЙ РЕНДЕРИНГ: Режим просмотра ИЛИ Режим редактирования */}
          {isEditing ? (
            // --- РЕЖИМ РЕДАКТИРОВАНИЯ ---
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                    background: '#272729', border: '1px solid #343536', color: '#d7dadc',
                    padding: '8px', borderRadius: '4px', fontSize: '1.2rem', fontWeight: 'bold', width: '100%'
                }}
              />
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={isPreview ? 5 : 15}
                style={{
                    background: '#272729', border: '1px solid #343536', color: '#d7dadc',
                    padding: '8px', borderRadius: '4px', resize: 'vertical', width: '100%', fontFamily: 'monospace'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <button onClick={handleSaveEdit} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px' }}>
                    <Save size={16} /> Сохранить
                </button>
                <button onClick={handleCancelEdit} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'transparent', border: '1px solid #343536', color: '#d7dadc' }}>
                    <X size={16} /> Отмена
                </button>
              </div>
            </div>
          ) : (
            // --- РЕЖИМ ПРОСМОТРА (Обычный) ---
            isPreview ? (
              <Link to={`/post/${post.id}`}>
                <h3 className="post-title">{post.title}</h3>
                <div className="post-text markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentToRender}</ReactMarkdown>
                </div>
              </Link>
            ) : (
              <>
                <h1 className="post-title" style={{ fontSize: '1.4rem' }}>{post.title}</h1>
                <div className="post-text markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{safeContent}</ReactMarkdown>
                </div>
              </>
            )
          )}

          {/* Футер с комментариями и шарингом (скрываем при редактировании) */}
          {!isEditing && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '15px', color: '#818384', fontSize: '0.8rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MessageSquare size={16} />
                {post.comments?.length || 0} Комментариев
                </div>
                
                <div ref={shareRef} style={{ position: 'relative' }}>
                <div 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowShareMenu(!showShareMenu); }} 
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }} 
                    className="hover-effect"
                >
                    <Share2 size={16} /> Поделиться
                </div>

                {showShareMenu && (
                    <div style={{
                    position: 'absolute', bottom: '100%', left: '0', marginBottom: '10px',
                    backgroundColor: '#272729', border: '1px solid #343536', borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', flexDirection: 'row', padding: '8px', gap: '8px'
                    }}>
                    <button onClick={handleCopyLink} style={iconButtonStyle} title="Скопировать ссылку"> <Copy size={20} /> </button>
                    <button onClick={() => handleSocialShare('telegram')} style={iconButtonStyle} title="Telegram"> <Send size={20} /> </button>
                    <button onClick={() => handleSocialShare('whatsapp')} style={iconButtonStyle} title="WhatsApp"> <MessageCircle size={20} /> </button>
                    <button onClick={() => handleSocialShare('twitter')} style={iconButtonStyle} title="Twitter"> <Twitter size={20} /> </button>
                    </div>
                )}
                </div>
            </div>
          )}
        </div>
      </div>

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

// Стили для кнопок-иконок
const iconButtonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px',
  background: 'transparent', border: 'none', borderRadius: '4px', color: '#d7dadc', cursor: 'pointer', transition: 'background 0.2s',
};