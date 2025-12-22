export interface Post {
  post_id: string;
  user_id: string;
  username: string;
  title: string;
  content: string;
  slug: string;
  category: string;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
  commentcount: number;
  showcomment: boolean;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  edited?: boolean;
}

export interface Comment {
  comment_id: string;
  post_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  parent_comment_id?: string | null; 
  replies?: Comment[];
  replyCount?: number;
  edited?: boolean;
}

export const CATEGORY_OPTIONS = [
  'Study Tips',
  'Product Updates',
  'Learning Strategies',
  'User Stories',
  'Tutorials',
  'Announcements',
  'Educational Resources'
] as const;

export type CategoryType = typeof CATEGORY_OPTIONS[number];