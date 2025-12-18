import { Component, ViewChildren, QueryList, AfterViewInit, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../../service/community.service';
import { PostCard } from './components/post-card/post-card/post-card';
import { Post, Comment } from '../../models/post.model';
import { Subject, takeUntil } from 'rxjs';
import { CreatePost } from './components/create-post/create-post';
import { Search } from './components/search/search';
import { PostModal } from './components/post-modal/post-modal';
import { AuthService } from '../../../service/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ProfanityFilterService } from '../../../service/profanity-filter.service';

@Component({
  selector: 'app-community-page',
  standalone: true,
  imports: [CommonModule, 
            FormsModule, 
            CreatePost, 
            Search, 
            PostCard, 
            PostModal],
  templateUrl: './community-page.html',
  styleUrl: './community-page.scss'
})
export class CommunityPage implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  
  posts: Post[] = [];
  allComments: Comment[] = [];
  filteredPosts: Post[] = [];
  showCreateModal = false;
  showPostModal = false;
  selectedPost: Post | null = null;
  editingPost: Post | null = null;
  searchQuery = '';
  currentUserInitial = 'J';
  currentUserId = '';
  isSidebarCollapsed = false;
  now: Date = new Date();
  private timeInterval: any;
  pendingPostId: string | null = null;
  pendingCommentId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private communityService: CommunityService, private profanityService: ProfanityFilterService) {}

  ngOnInit() {
    this.setCurrentUserInitial();
    this.communityService.loadInitialData();
    // Capture deep-link targets from query params (postId, commentId)
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const postId = params['postId'];
      const commentId = params['commentId'];
      this.pendingPostId = postId ?? null;
      this.pendingCommentId = commentId ?? null;
      // If posts already loaded, try opening immediately
      if (this.pendingPostId && this.posts.length > 0) {
        const target = this.posts.find(p => p.post_id === this.pendingPostId);
        if (target) {
          this.openPostModal(target);
        }
      }
    });
    this.subscribeToUpdates();
    // Global clock: update frequently to refresh time labels in sync with child components
    this.timeInterval = setInterval(() => {
      this.now = new Date();
    }, 15000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  setCurrentUserInitial() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.username) {
      this.currentUserInitial = currentUser.username.charAt(0).toUpperCase();
      this.currentUserId = currentUser.userId?.toString() || '';
    }
  }

  subscribeToUpdates() {
    this.communityService.posts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(posts => {
        this.posts = posts;
        this.applyFilter();
        
        if (this.selectedPost) {
          const updatedPost = 
          posts.find(p => p.post_id === this.selectedPost!.post_id);
          if (updatedPost) {
            this.selectedPost = updatedPost;
          }
        }

        // Handle pending deep-link to a specific post (from notifications)
        if (this.pendingPostId) {
          const target = posts.find(p => p.post_id === this.pendingPostId);
          if (target) {
            this.openPostModal(target);
            // Clear pending after opening
            this.pendingPostId = null;
          }
        }
      });

    this.communityService.comments$
      .pipe(takeUntil(this.destroy$))
      .subscribe(comments => {
        this.allComments = comments;
      });
  }

  onSidebarToggled(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.applyFilter();
  }

  applyFilter() {
    if (this.searchQuery.trim()) {
      this.filteredPosts = 
        this.communityService.searchPostsByCategory(this.searchQuery);
    } else {
      this.filteredPosts = [...this.posts];
    }
  }

  openCreateModal() {
    this.editingPost = null;
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.editingPost = null;
  }

  openPostModal(post: Post) {
    this.selectedPost = post;
    this.showPostModal = true;
  }

  closePostModal() {
    this.showPostModal = false;
    this.selectedPost = null;
  }

  onCreatePost(newPost: Partial<Post>) {
    this.communityService.createPost(newPost);
  }

  onUpdatePost(event: {postId: string, updates: Partial<Post>}) {
    this.communityService.updatePost(event.postId, event.updates);
  }

  onLikePost(post: Post) {
    this.communityService.toggleLikePost(post.post_id);
  }

  onDislikePost(post: Post) {
    this.communityService.toggleDislikePost(post.post_id);
  }

  onLikePostInModal() {
    if (this.selectedPost) {
      this.communityService.toggleLikePost(this.selectedPost.post_id);
    }
  }

  onDislikePostInModal() {
    if (this.selectedPost) {
      this.communityService.toggleDislikePost(this.selectedPost.post_id);
    }
  }

  onDeletePost(action: { post: Post; setPrivate?: boolean; permanent?: boolean }) {
    if (action.permanent) {
      this.communityService.deletePostPermanently(action.post.post_id);
    } else {
      this.communityService.unpublishPost(action.post.post_id, action.setPrivate ?? false);
    }
  }

  onEditPost(post: Post) {
    this.editingPost = post;
    this.showCreateModal = true;
  }

  onAddComment(content: string) {
    if (!this.selectedPost) return;
    
    const hashBadwords = this.profanityService.hasBadWords(content);
    const cleanedContent = this.profanityService.clean(content);

    if (!cleanedContent.trim()) {
      alert ('Comment cannot be empty');
      return;
    }

    if (hashBadwords) {
      console.warn('Profanity deteced and cleaned');
    }

    if (this.selectedPost?.post_id) {
      this.communityService.createComment(
        this.selectedPost.post_id,
        cleanedContent
      );
    }
  }

  onLikeComment(event: {comment: Comment, isReply: boolean}) {
    this.communityService.toggleLikeComment(event.comment.comment_id);
  }

  onDislikeComment(event: {comment: Comment, isReply: boolean}) {
    this.communityService.toggleDislikeComment(event.comment.comment_id);
  }

  onEditComment(event: {comment: Comment, newContent: string}) {
    this.communityService.updateComment(
      event.comment.comment_id, 
      event.newContent
    );
  }

  onDeleteComment(comment: Comment) {
    this.communityService.deleteComment(comment.comment_id);
  }

  getCommentsForPost(postId: string): Comment[] {
    return this.communityService.getCommentsForPost(postId);
  }
}