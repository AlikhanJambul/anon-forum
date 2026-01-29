import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Post } from '../types';
import { generateId, generateAnonName } from '../utils/helpers';

interface PostContextType {
  posts: Post[];
  addPost: (title: string, content: string, category: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  votePost: (postId: string, value: number) => Promise<void>;
  getPost: (id: string) => Post | undefined;
  isLoading: boolean; // New loading state
}

const PostContext = createContext<PostContextType | undefined>(undefined);

// URL for your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api/posts';

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // PERSISTENT STORAGE: Fetch posts from PostgreSQL on load
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ASYNC/AWAIT: Handle network latency for new posts
  const addPost = async (title: string, content: string, category: string) => {
    const newPost = {
      id: generateId(),
      title,
      content,
      author: generateAnonName(),
      category,
      upvotes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      const savedPost = await response.json();
      setPosts(prev => [savedPost, ...prev]);
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const addComment = async (postId: string, text: string) => {
    const newComment = {
      id: generateId(),
      postId,
      text,
      author: generateAnonName(),
      createdAt: new Date().toISOString()
    };

    try {
      await fetch(`${API_BASE_URL}/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });
      // Refresh posts to show the new comment
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const votePost = async (postId: string, value: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${postId}/vote?value=${value}`, {
        method: 'PATCH',
      });
      const updatedPost = await response.json();
      setPosts(prev => prev.map(post => post.id === postId ? updatedPost : post));
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const getPost = (id: string) => posts.find(p => p.id === id);

  return (
    <PostContext.Provider value={{ 
      posts, 
      addPost, 
      deletePost, 
      addComment, 
      votePost, 
      getPost,
      isLoading 
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