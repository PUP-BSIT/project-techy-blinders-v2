import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post, Comment } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private postsSubject = new BehaviorSubject<Post[]>([]);
  public posts$ = this.postsSubject.asObservable();
  
  private commentsSubject = new BehaviorSubject<Comment[]>([]);
  public comments$ = this.commentsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockPosts: Post[] = [
      {
        post_id: '1',
        user_id: 'user1',
        username: 'John Doe',
        title: 'What is Lorem Ipsum?',
        content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
        slug: 'what-is-lorem-ipsum',
        category: 'Tutorials',
        is_published: true,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        commentcount: 2,
        showcomment: false,
        likes: 10,
        dislikes: 1,
        userLiked: false,
        userDisliked: false
      },
      {
        post_id: '2',
        user_id: 'user1',
        username: 'John Doe',
        title: 'Why do we use it?',
        content: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
        slug: 'why-do-we-use-it',
        category: 'Study Tips',
        is_published: true,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        commentcount: 0,
        showcomment: false,
        likes: 0,
        dislikes: 0,
        userLiked: false,
        userDisliked: false
      }
    ];

    const mockComments: Comment[] = [
      {
        comment_id: '1',
        post_id: '1',
        user_id: 'user2',
        username: 'Jane Dee',
        content: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 10,
        dislikes: 1,
        userLiked: false,
        userDisliked: false
      },
      {
        comment_id: '2',
        post_id: '1',
        user_id: 'user2',
        username: 'Jane Dee',
        content: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 10,
        dislikes: 1,
        userLiked: false,
        userDisliked: false
      }
    ];

    this.postsSubject.next(mockPosts);
    this.commentsSubject.next(mockComments);
  }

  getPosts(): Post[] {
    return this.postsSubject.value;
  }

  getComments(): Comment[] {
    return this.commentsSubject.value;
  }

  createPost(post: Partial<Post>): Post {
    const newPost: Post = {
      post_id: Date.now().toString(),
      user_id: 'current_user',
      username: 'John Doe',
      title: post.title!,
      content: post.content!,
      slug: post.slug!,
      category: post.category!,
      is_published: true,
      created_at: new Date(),
      updated_at: new Date(),
      commentcount: 0,
      showcomment: false,
      likes: 0,
      dislikes: 0,
      userLiked: false,
      userDisliked: false
    };

    const currentPosts = this.postsSubject.value;
    this.postsSubject.next([newPost, ...currentPosts]);
    return newPost;
  }

  updatePost(postId: string, updates: Partial<Post>): void {
    const posts = this.postsSubject.value;
    const index = posts.findIndex(p => p.post_id === postId);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates, updated_at: new Date() };
      this.postsSubject.next([...posts]);
    }
  }

  deletePost(postId: string): void {
    const posts = this.postsSubject.value;
    this.postsSubject.next(posts.filter(p => p.post_id !== postId));
    
    const comments = this.commentsSubject.value;
    this.commentsSubject.next(comments.filter(c => c.post_id !== postId));
  }

  toggleLikePost(postId: string): void {
    const posts = this.postsSubject.value;
    const index = posts.findIndex(p => p.post_id === postId);
    if (index !== -1) {
      const post = posts[index];
      if (post.userLiked) {
        post.likes--;
        post.userLiked = false;
      } else {
        if (post.userDisliked) {
          post.dislikes--;
          post.userDisliked = false;
        }
        post.likes++;
        post.userLiked = true;
      }
      this.postsSubject.next([...posts]);
    }
  }

  toggleDislikePost(postId: string): void {
    const posts = this.postsSubject.value;
    const index = posts.findIndex(p => p.post_id === postId);
    if (index !== -1) {
      const post = posts[index];
      if (post.userDisliked) {
        post.dislikes--;
        post.userDisliked = false;
      } else {
        if (post.userLiked) {
          post.likes--;
          post.userLiked = false;
        }
        post.dislikes++;
        post.userDisliked = true;
      }
      this.postsSubject.next([...posts]);
    }
  }

  toggleShowComments(postId: string): void {
    const posts = this.postsSubject.value;
    const index = posts.findIndex(p => p.post_id === postId);
    if (index !== -1) {
      posts[index].showcomment = !posts[index].showcomment;
      this.postsSubject.next([...posts]);
    }
  }

  createComment(postId: string, content: string): Comment {
    const newComment: Comment = {
      comment_id: Date.now().toString(),
      post_id: postId,
      user_id: 'current_user',
      username: 'John Doe',
      content: content,
      created_at: new Date(),
      likes: 0,
      dislikes: 0,
      userLiked: false,
      userDisliked: false
    };

    const comments = this.commentsSubject.value;
    this.commentsSubject.next([...comments, newComment]);

    const posts = this.postsSubject.value;
    const postIndex = posts.findIndex(p => p.post_id === postId);
    if (postIndex !== -1) {
      posts[postIndex].commentcount++;
      this.postsSubject.next([...posts]);
    }

    return newComment;
  }

  toggleLikeComment(commentId: string): void {
    const comments = this.commentsSubject.value;
    const index = comments.findIndex(c => c.comment_id === commentId);
    if (index !== -1) {
      const comment = comments[index];
      if (comment.userLiked) {
        comment.likes--;
        comment.userLiked = false;
      } else {
        if (comment.userDisliked) {
          comment.dislikes--;
          comment.userDisliked = false;
        }
        comment.likes++;
        comment.userLiked = true;
      }
      this.commentsSubject.next([...comments]);
    }
  }

  toggleDislikeComment(commentId: string): void {
    const comments = this.commentsSubject.value;
    const index = comments.findIndex(c => c.comment_id === commentId);
    if (index !== -1) {
      const comment = comments[index];
      if (comment.userDisliked) {
        comment.dislikes--;
        comment.userDisliked = false;
      } else {
        if (comment.userLiked) {
          comment.likes--;
          comment.userLiked = false;
        }
        comment.dislikes++;
        comment.userDisliked = true;
      }
      this.commentsSubject.next([...comments]);
    }
  }

  getCommentsForPost(postId: string): Comment[] {
    return this.commentsSubject.value.filter(c => c.post_id === postId);
  }

  searchPostsByCategory(query: string): Post[] {
    const posts = this.postsSubject.value;
    if (!query.trim()) {
      return posts;
    }
    return posts.filter(post => 
      post.category.toLowerCase().includes(query.toLowerCase())
    );
  }
}