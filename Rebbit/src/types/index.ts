export interface Comment {
  id: string;
  postId: string;
  text: string;
  author: string; // Например, "Anon #4521"
  createdAt: string;
  imageUrl?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  upvotes: number;
  comments: Comment[];
  createdAt: string;
  imageUrl?: string;
}