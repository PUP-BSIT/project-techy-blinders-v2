import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Post, Comment } from '../models/post.model';
import { AuthService } from '../../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = '/api';
  
  private postsSubject = new BehaviorSubject<Post[]>([]);
  public posts$ = this.postsSubject.asObservable();
  
  private commentsSubject = new BehaviorSubject<Comment[]>([]);
  public comments$ = this.commentsSubject.asObservable();

  constructor() {
    this.refreshPosts();
    this.refreshComments();
  }

  // Call this from components to force re-fetch when entering the page.
  loadInitialData(): void {
    this.refreshPosts();
    this.refreshComments();
  }

  getPosts(): Post[] {
    return this.postsSubject.value;
  }

  getComments(): Comment[] {
    return this.commentsSubject.value;
  }

  private refreshPosts(): void {
    console.log('Fetching posts from:', `${this.apiUrl}/posts`);
    this.http.get<any[]>(`${this.apiUrl}/posts`).subscribe({
      next: posts => {
        console.log('✓ Raw API Response:', posts);
        console.log('First post sample:', posts[0]);
        this.postsSubject.next(posts.map(p => this.mapPostFromApi(p)));
      },
      error: err => {
        console.error('✗ Failed to load posts:', err);
        // Keep empty array if fetch fails
        this.postsSubject.next([]);
      }
    });
  }

  private refreshComments(): void {
    console.log('Fetching comments from:', `${this.apiUrl}/comments`);
    this.http.get<any[]>(`${this.apiUrl}/comments`).subscribe({
      next: comments => {
        console.log('✓ Comments fetched successfully:', comments);
        const mapped = comments.map(c => this.mapCommentFromApi(c));
        this.commentsSubject.next(mapped);
        this.recomputeCommentCounts(mapped);
      },
      error: err => {
        console.error('✗ Failed to load comments:', err);
        // Keep empty array if fetch fails
        this.commentsSubject.next([]);
      }
    });
  }

  createPost(post: Partial<Post>): void {
    const currentUser = this.authService.getCurrentUser();
    const payload = {
      userId: Number(post.user_id ?? currentUser?.userId ?? 0),
      username: post.username ?? currentUser?.username ?? 'Guest User',
      title: post.title,
      content: post.content,
      slug: post.slug ?? this.slugify(post.title ?? ''),
      category: post.category,
      publish: post.is_published ?? false,
      commentCount: post.commentcount ?? 0,
      showComment: post.showcomment ?? true,
      numLike: post.likes ?? 0,
      numDislike: post.dislikes ?? 0
    };

    this.http.post<any>(`${this.apiUrl}/posts`, payload).subscribe({
      next: created => {
        const mapped = this.mapPostFromApi(created);
        const currentPosts = this.postsSubject.value;
        this.postsSubject.next([mapped, ...currentPosts]);
      },
      error: err => console.error('Failed to create post', err)
    });
  }

  updatePost(postId: string, updates: Partial<Post>): void {
    const existing = this.postsSubject.value.find(p => p.post_id === postId);
    if (!existing) {
      return;
    }

    const merged: Post = {
      ...existing,
      ...updates,
      updated_at: new Date()
    };

    const payload = this.buildPostPayload(merged);

    this.http.put<any>(`${this.apiUrl}/posts/${postId}`, payload).subscribe({
      next: updated => {
        const mapped = this.mapPostFromApi(updated);
        // preserve local UI flags
        mapped.userLiked = merged.userLiked;
        mapped.userDisliked = merged.userDisliked;
        this.replacePost(mapped);
      },
      error: err => console.error('Failed to update post', err)
    });
  }

  deletePost(postId: string): void {
    this.http.delete(`${this.apiUrl}/posts/${postId}`).subscribe({
      next: () => {
        this.postsSubject.next(this.postsSubject.value.filter(p => p.post_id !== postId));
        this.commentsSubject.next(this.commentsSubject.value.filter(c => c.post_id !== postId));
      },
      error: err => console.error('Failed to delete post', err)
    });
  }

  toggleLikePost(postId: string): void {
    const post = this.postsSubject.value.find(p => p.post_id === postId);
    if (!post) {
      return;
    }

    const updated: Post = { ...post };
    if (updated.userLiked) {
      updated.likes = Math.max(0, updated.likes - 1);
      updated.userLiked = false;
    } else {
      if (updated.userDisliked) {
        updated.dislikes = Math.max(0, updated.dislikes - 1);
        updated.userDisliked = false;
      }
      updated.likes += 1;
      updated.userLiked = true;
    }

    this.updatePost(postId, updated);
  }

  toggleDislikePost(postId: string): void {
    const post = this.postsSubject.value.find(p => p.post_id === postId);
    if (!post) {
      return;
    }

    const updated: Post = { ...post };
    if (updated.userDisliked) {
      updated.dislikes = Math.max(0, updated.dislikes - 1);
      updated.userDisliked = false;
    } else {
      if (updated.userLiked) {
        updated.likes = Math.max(0, updated.likes - 1);
        updated.userLiked = false;
      }
      updated.dislikes += 1;
      updated.userDisliked = true;
    }

    this.updatePost(postId, updated);
  }

  toggleShowComments(postId: string): void {
    const post = this.postsSubject.value.find(p => p.post_id === postId);
    if (!post) {
      return;
    }
    this.updatePost(postId, { ...post, showcomment: !post.showcomment });
  }

  createComment(postId: string, content: string): void {
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.userId?.toString() || '0';
    const username = currentUser?.username || 'Guest User';

    const mentionMatch = content.match(/^@([^@\n]+?)\s+(.+)/);
    let parentCommentId: string | null = null;
    let cleanContent = content;

    if (mentionMatch) {
      const mentionedUsername = mentionMatch[1].trim();
      const comments = this.commentsSubject.value;
      const parentComment = comments.find(
        c => c.username.toLowerCase() === mentionedUsername.toLowerCase() && c.post_id === postId && !c.parent_comment_id
      );
      if (parentComment) {
        parentCommentId = parentComment.comment_id;
        cleanContent = mentionMatch[2].trim();
      }
    }

    const payload: any = {
      userId: Number(userId),
      postId: Number(postId),
      username,
      content: cleanContent,
      parentCommentId: parentCommentId ? Number(parentCommentId) : null
    };

    this.http.post<any>(`${this.apiUrl}/comments`, payload).subscribe({
      next: created => {
        const mapped = this.mapCommentFromApi(created);
        const comments = [...this.commentsSubject.value, mapped];
        this.commentsSubject.next(comments);

        const posts = this.postsSubject.value.map(p =>
          p.post_id === postId ? { ...p, commentcount: p.commentcount + 1 } : p
        );
        this.postsSubject.next(posts);
      },
      error: err => console.error('Failed to create comment', err)
    });
  }

  toggleLikeComment(commentId: string): void {
    this.http.put<any>(`${this.apiUrl}/comments/${commentId}/like`, {}).subscribe({
      next: updated => this.updateCommentInState(this.mapCommentFromApi(updated)),
      error: err => console.error('Failed to like comment', err)
    });
  }

  toggleDislikeComment(commentId: string): void {
    this.http.put<any>(`${this.apiUrl}/comments/${commentId}/dislike`, {}).subscribe({
      next: updated => this.updateCommentInState(this.mapCommentFromApi(updated)),
      error: err => console.error('Failed to dislike comment', err)
    });
  }

  getCommentsForPost(postId: string): Comment[] {
    return this.commentsSubject.value.filter(c => c.post_id === postId);
  }

  updateComment(commentId: string, newContent: string): void {
    this.http.put<any>(`${this.apiUrl}/comments/${commentId}`, { content: newContent }).subscribe({
      next: updated => this.updateCommentInState(this.mapCommentFromApi(updated)),
      error: err => console.error('Failed to update comment', err)
    });
  }

  deleteComment(commentId: string): void {
    this.http.delete(`${this.apiUrl}/comments/${commentId}`).subscribe({
      next: () => {
        const comments = this.commentsSubject.value;
        const target = comments.find(c => c.comment_id === commentId);
        this.commentsSubject.next(comments.filter(c => c.comment_id !== commentId));

        if (target) {
          const posts = this.postsSubject.value.map(p =>
            p.post_id === target.post_id ? { ...p, commentcount: Math.max(0, p.commentcount - 1) } : p
          );
          this.postsSubject.next(posts);
        }
      },
      error: err => console.error('Failed to delete comment', err)
    });
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

  private mapPostFromApi(post: any): Post {
    console.log('Mapping post:', post);
    // Handle different possible field names from API response
    const mapped: Post = {
      post_id: String(post.postId ?? post.post_id ?? post.id ?? ''),
      user_id: String(post.userId ?? post.user_id ?? post.userId ?? ''),
      // Username is missing in the current API payload; fall back to userId so something meaningful shows up.
      username: post.username ?? post.userName ?? String(post.userId ?? post.user_id ?? ''),
      title: post.title ?? '',
      content: post.content ?? post.description ?? '',
      slug: post.slug ?? post.slug ?? '',
      category: typeof post.category === 'object' ? post.category.value ?? post.category : post.category ?? '',
      is_published: Boolean(post.isPublished ?? post.is_published ?? post.publish ?? false),
      created_at: post.createdAt ? new Date(post.createdAt) : post.created_at ? new Date(post.created_at) : new Date(),
      updated_at: post.updatedAt ? new Date(post.updatedAt) : post.updated_at ? new Date(post.updated_at) : new Date(),
      // Handle comment count variations
      commentcount: post.commentCount ?? post.commentcount ?? post.comments?.length ?? post.num_comments ?? 0,
      showcomment: Boolean(post.showComment ?? post.showcomment ?? true),
      // Handle likes/dislikes variations
      likes: post.numLike ?? post.likes ?? post.num_like ?? post.likeCount ?? 0,
      dislikes: post.numDislike ?? post.dislikes ?? post.num_dislike ?? post.dislikeCount ?? 0,
      userLiked: false,
      userDisliked: false
    };
    console.log('Mapped post:', mapped);
    return mapped;
  }

  private mapCommentFromApi(comment: any): Comment {
    console.log('Mapping comment:', comment);
    return {
      comment_id: String(comment.commentId ?? comment.comment_id ?? ''),
      post_id: String(comment.postId ?? comment.post_id ?? ''),
      user_id: String(comment.userId ?? comment.user_id ?? ''),
      username: comment.username ?? '',
      content: comment.content ?? '',
      created_at: comment.createdAt ? new Date(comment.createdAt) : comment.created_at ? new Date(comment.created_at) : new Date(),
      updated_at: comment.updatedAt ? new Date(comment.updatedAt) : comment.updated_at ? new Date(comment.updated_at) : new Date(),
      likes: comment.numLike ?? comment.likes ?? 0,
      dislikes: comment.numDislike ?? comment.dislikes ?? 0,
      userLiked: false,
      userDisliked: false,
      parent_comment_id: comment.parentCommentId ? String(comment.parentCommentId) : comment.parent_comment_id ?? null,
      replies: comment.replies ?? []
    };
  }

  private recomputeCommentCounts(comments: Comment[]): void {
    const counts = comments.reduce<Record<string, number>>((acc, comment) => {
      const key = comment.post_id;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const updatedPosts = this.postsSubject.value.map(post => ({
      ...post,
      commentcount: counts[post.post_id] ?? 0
    }));

    this.postsSubject.next(updatedPosts);
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private buildPostPayload(post: Post) {
    return {
      postId: Number(post.post_id),
      userId: Number(post.user_id),
      username: post.username,
      title: post.title,
      content: post.content,
      slug: post.slug,
      category: post.category,
      publish: post.is_published,
      showComment: post.showcomment,
      commentCount: post.commentcount,
      numLike: post.likes,
      numDislike: post.dislikes
    };
  }

  private replacePost(updated: Post): void {
    this.postsSubject.next(
      this.postsSubject.value.map(p => (p.post_id === updated.post_id ? updated : p))
    );
  }

  private updateCommentInState(updated: Comment): void {
    this.commentsSubject.next(
      this.commentsSubject.value.map(c => (c.comment_id === updated.comment_id ? updated : c))
    );
  }
}