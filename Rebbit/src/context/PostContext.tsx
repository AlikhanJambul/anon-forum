import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { Post } from '../types';
import { generateAnonName, generateId } from '../utils/helpers';

// Убедитесь, что порт совпадает с вашим backend (8080 или 8081)
const API_URL = 'http://localhost:8080/api/posts';
const API_BASE = 'http://localhost:8080'; // Для загрузки картинок

interface PostContextType {
  posts: Post[];
  // Обновили сигнатуры: добавили imageUrl
  addPost: (title: string, content: string, category: string, imageUrl?: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  updatePost: (id: string, title: string, content: string) => Promise<void>;
  addComment: (postId: string, text: string, imageUrl?: string) => Promise<void>;
  votePost: (postId: string, value: number) => Promise<void>;
  getPost: (id: string) => Post | undefined;
  searchPosts: (query: string) => Promise<Post[]>;
  // Новая функция загрузки
  uploadImage: (file: File) => Promise<string | null>;
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

  // --- ЗАГРУЗКА КАРТИНКИ ---
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Загрузка картинки...');
    try {
      const response = await fetch(`${API_BASE}/api/images/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const imageUrl = await response.text();
        toast.success('Картинка загружена!', { id: toastId });
        return imageUrl;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Ошибка загрузки картинки', { id: toastId });
      return null;
    }
  };

  // --- СОЗДАНИЕ ПОСТА (с картинкой) ---
  const addPost = async (title: string, content: string, category: string, imageUrl?: string) => {
    const toastId = toast.loading('Публикуем...');
    const newPost = {
      id: generateId(),
      title,
      content,
      author: generateAnonName(),
      category,
      imageUrl, // <-- Добавляем URL картинки
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

  const updatePost = async (id: string, title: string, content: string) => {
    const toastId = toast.loading('Сохранение...');
    try {
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

  // --- ДОБАВЛЕНИЕ КОММЕНТАРИЯ (с картинкой) ---
  const addComment = async (postId: string, text: string, imageUrl?: string) => {
    const newComment = {
      id: generateId(),
      text,
      author: generateAnonName(),
      imageUrl, // <-- Добавляем URL картинки
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
      updatePost,
      addComment, 
      votePost, 
      getPost,
      searchPosts,
      uploadImage // Экспортируем функцию
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