import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PostProvider, usePosts } from './PostContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PostProvider>{children}</PostProvider>
);

describe('PostContext logic tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add a new post correctly', () => {
    const { result } = renderHook(() => usePosts(), { wrapper });

    act(() => {
      result.current.addPost('Test Title', 'Test Content', 'General');
    });

    expect(result.current.posts[0].title).toBe('Test Title');
    expect(result.current.posts[0].upvotes).toBe(0); //
  });

  it('should update upvotes when voting', () => {
    const { result } = renderHook(() => usePosts(), { wrapper });

    act(() => {
      result.current.addPost('Vote Test', 'Content', 'General');
    });
    const postId = result.current.posts[0].id;

    act(() => {
      result.current.votePost(postId, 1);
    });
    expect(result.current.getPost(postId)?.upvotes).toBe(1); //

    act(() => {
      result.current.votePost(postId, -1);
    });
    expect(result.current.getPost(postId)?.upvotes).toBe(0);
  });

  it('should delete a post', () => {
    const { result } = renderHook(() => usePosts(), { wrapper });

    act(() => {
      result.current.addPost('To be deleted', 'Content', 'General');
    });
    const postId = result.current.posts[0].id;

    act(() => {
      result.current.deletePost(postId);
    });

    expect(result.current.posts.find(p => p.id === postId)).toBeUndefined(); //
  });
});