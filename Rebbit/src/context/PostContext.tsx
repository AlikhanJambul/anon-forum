import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Post } from '../types';
import { generateId, generateAnonName } from '../utils/helpers';

// 1. Описываем, что умеет наш контекст
interface PostContextType {
  posts: Post[];
  addPost: (title: string, content: string, category: string) => void; // <--- Обновили тут (category)
  deletePost: (id: string) => void;
  addComment: (postId: string, text: string) => void;
  votePost: (postId: string, value: number) => void;
  getPost: (id: string) => Post | undefined;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

// 2. Функция загрузки из LocalStorage
const getInitialPosts = (): Post[] => {
  const saved = localStorage.getItem('rebbit_posts');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Ошибка парсинга JSON', e);
    }
  }
  return [
    {
      id: '1',
      title: 'Добро пожаловать в Rebbit! 🔥',
      content: 'Это анонимный клон реддита. Теперь ваши посты сохраняются!',
      author: 'System',
      category: 'News',
      upvotes: 1337,
      comments: [],
      createdAt: new Date().toISOString()
    }
  ];
};

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>(getInitialPosts);

  // 3. Сохраняем в LocalStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('rebbit_posts', JSON.stringify(posts));
  }, [posts]);

  // 4. Добавляем пост (принимаем category)
  const addPost = (title: string, content: string, category: string) => {
    const newPost: Post = {
      id: generateId(),
      title,
      content,
      author: generateAnonName(),
      category, // Сохраняем категорию
      upvotes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id));
  };

  const addComment = (postId: string, text: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: generateId(),
            postId,
            text,
            author: generateAnonName(),
            createdAt: new Date().toISOString()
          }]
        };
      }
      return post;
    }));
  };

  const votePost = (postId: string, value: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, upvotes: post.upvotes + value } : post
    ));
  };

  const getPost = (id: string) => posts.find(p => p.id === id);

  // 5. ВОТ ТВОЙ ВОПРОС: Передаем всё это в value
  return (
    <PostContext.Provider value={{ 
      posts, 
      addPost, 
      deletePost, 
      addComment, 
      votePost, 
      getPost 
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