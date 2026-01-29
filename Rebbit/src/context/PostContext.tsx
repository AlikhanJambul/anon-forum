import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast'; // <-- Импорт toast
import type { Post } from '../types';
import { generateAnonName, generateId } from '../utils/helpers';

const API_URL = 'http://localhost:8080/api/posts';

interface PostContextType {
  posts: Post[];
  addPost: (title: string, content: string, category: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  updatePost: (id: string, title: string, content: string) => Promise<void>; // <-- НОВОЕ
  addComment: (postId: string, text: string) => Promise<void>;
  votePost: (postId: string, value: number) => Promise<void>;
  getPost: (id: string) => Post | undefined;
  searchPosts: (query: string) => Promise<Post[]>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Ошибка загрузки постов');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Не удалось загрузить посты:', error);
      toast.error('Не удалось загрузить посты');
    }
  };

  const addPost = async (title: string, content: string, category: string) => {
    const toastId = toast.loading('Публикуем...');
    const newPost = {
      id: generateId(),
      title,
      content,
      author: generateAnonName(),
      category,
      upvotes: 0,
      createdAt: new Date().toISOString(),
      comments: []
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        const savedPost = await response.json();
        setPosts(prev => [savedPost, ...prev]);
        toast.success('Пост опубликован!', { id: toastId });
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Ошибка при создании поста', { id: toastId });
    }
  };

  // --- НОВАЯ ФУНКЦИЯ РЕДАКТИРОВАНИЯ ---
  const updatePost = async (id: string, title: string, content: string) => {
    const toastId = toast.loading('Сохранение...');
    try {
      // Отправляем только то, что меняем (author, category и т.д. останутся старыми на бэке)
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(prev => prev.map(post => post.id === id ? updatedPost : post));
        toast.success('Пост обновлен!', { id: toastId });
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Ошибка при сохранении', { id: toastId });
    }
  };

  const deletePost = async (id: string) => {
    const toastId = toast.loading('Удаление...');
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(post => post.id !== id));
      toast.success('Пост удален', { id: toastId });
    } catch (error) {
      toast.error('Ошибка удаления', { id: toastId });
    }
  };

  const addComment = async (postId: string, text: string) => {
    const newComment = {
      id: generateId(),
      text,
      author: generateAnonName(),
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_URL}/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });

      if (response.ok) {
        const savedComment = await response.json();
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, comments: [...(post.comments || []), savedComment] } : post
        ));
        toast.success('Комментарий добавлен');
      }
    } catch (error) {
      toast.error('Ошибка при добавлении комментария');
    }
  };

  const votePost = async (postId: string, value: number) => {
    try {
      const response = await fetch(`${API_URL}/${postId}/vote?value=${value}`, { method: 'PATCH' });
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(prev => prev.map(post => post.id === postId ? updatedPost : post));
      }
    } catch (error) {
     // Голосование обычно тихое, ошибку можно не показывать тостом, только в консоль
     console.error('Vote error', error);
    }
  };

  const searchPosts = async (query: string): Promise<Post[]> => {
    if (!query.trim()) return [];
    try {
      const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    return [];
  };

  const getPost = (id: string) => posts.find(p => p.id === id);

  return (
    <PostContext.Provider value={{ 
      posts, 
      addPost, 
      deletePost, 
      updatePost, // <-- Добавили в провайдер
      addComment, 
      votePost, 
      getPost,
      searchPosts
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePosts must be used within a PostProvider');
  return context;
};