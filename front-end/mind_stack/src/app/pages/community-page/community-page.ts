import { Component, ViewChildren, QueryList, AfterViewInit, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);
  
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

  // Popup alert properties
  isCommentAddedPopupOpen: boolean = false;
  isCommentEditedPopupOpen: boolean = false;
  isCommentDeletedPopupOpen: boolean = false;
  isPostEditedPopupOpen: boolean = false;
  isPostDeletedPopupOpen: boolean = false;
  isPostLikedPopupOpen: boolean = false;
  isPostDislikedPopupOpen: boolean = false;
  isCommentLikedPopupOpen: boolean = false;
  isCommentDislikedPopupOpen: boolean = false;

  postLikeMessage: string = 'Post liked!';
  postDislikeMessage: string = 'Post disliked!';
  commentLikeMessage: string = 'Comment liked!';
  commentDislikeMessage: string = 'Comment disliked!';
  isLoading: boolean = true;

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
        console.log('Posts updated, count:', posts.length);
        this.posts = posts;
        this.applyFilter();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
        
        if (this.selectedPost) {
          const updatedPost = 
          posts.find(p => p.post_id === this.selectedPost!.post_id);
          if (updatedPost) {
            this.selectedPost = updatedPost;
          } else {
            // Post was deleted, close the modal
            console.log('Selected post was deleted, closing modal');
            this.closePostModal();
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
        console.log('Comments updated, count:', comments.length);
        this.allComments = comments;
        this.cdr.detectChanges();
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
    this.isPostEditedPopupOpen = false;
    setTimeout(() => {
      this.openPostEditedPopup();
    }, 10);
  }

  onLikePost(post: Post) {
    const wasLiked = post.userLiked === true;
    this.communityService.toggleLikePost(post.post_id);
    this.isPostLikedPopupOpen = false;
    this.postLikeMessage = wasLiked ? 'Like removed!' : 'Post liked!';
    setTimeout(() => {
      this.openPostLikedPopup();
    }, 10);
  }

  onDislikePost(post: Post) {
    const wasDisliked = post.userDisliked === true;
    this.communityService.toggleDislikePost(post.post_id);
    this.isPostDislikedPopupOpen = false;
    this.postDislikeMessage = wasDisliked ? 'Dislike removed!' : 'Post disliked!';
    setTimeout(() => {
      this.openPostDislikedPopup();
    }, 10);
  }

  onLikePostInModal() {
    if (this.selectedPost) {
      const wasLiked = this.selectedPost.userLiked === true;
      this.communityService.toggleLikePost(this.selectedPost.post_id);
      this.isPostLikedPopupOpen = false;
      this.postLikeMessage = wasLiked ? 'Like removed!' : 'Post liked!';
      setTimeout(() => {
        this.openPostLikedPopup();
      }, 10);
    }
  }

  onDislikePostInModal() {
    if (this.selectedPost) {
      const wasDisliked = this.selectedPost.userDisliked === true;
      this.communityService.toggleDislikePost(this.selectedPost.post_id);
      this.isPostDislikedPopupOpen = false;
      this.postDislikeMessage = wasDisliked ? 'Dislike removed!' : 'Post disliked!';
      setTimeout(() => {
        this.openPostDislikedPopup();
      }, 10);
    }
  }

  onDeletePost(action: { post: Post; setPrivate?: boolean; permanent?: boolean }) {
    if (action.permanent) {
      this.communityService.deletePostPermanently(action.post.post_id, action.setPrivate ?? true);
    } else {
      this.communityService.unpublishPost(action.post.post_id, action.setPrivate ?? false);
    }
    // Close the modal immediately when post is deleted
    this.closePostModal();
    this.isPostDeletedPopupOpen = false;
    setTimeout(() => {
      this.openPostDeletedPopup();
    }, 10);
  }

  onEditPost(post: Post) {
    this.editingPost = post;
    this.showCreateModal = true;
  }

  onAddComment(data: {content: string, parentCommentId?: string}) {
    if (!this.selectedPost) return;
    
    const hashBadwords = this.profanityService.hasBadWords(data.content);
    const cleanedContent = this.profanityService.clean(data.content);

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
        cleanedContent,
        data.parentCommentId
      );
      this.isCommentAddedPopupOpen = false;
      setTimeout(() => {
        this.openCommentAddedPopup();
      }, 10);
    }
  }

  onLikeComment(event: {comment: Comment, isReply: boolean}) {
    const wasLiked = event.comment.userLiked === true;
    this.communityService.toggleLikeComment(event.comment.comment_id);
    this.isCommentLikedPopupOpen = false;
    this.commentLikeMessage = wasLiked ? 'Like removed!' : 'Comment liked!';
    setTimeout(() => {
      this.openCommentLikedPopup();
    }, 10);
  }

  onDislikeComment(event: {comment: Comment, isReply: boolean}) {
    const wasDisliked = event.comment.userDisliked === true;
    this.communityService.toggleDislikeComment(event.comment.comment_id);
    this.isCommentDislikedPopupOpen = false;
    this.commentDislikeMessage = wasDisliked ? 'Dislike removed!' : 'Comment disliked!';
    setTimeout(() => {
      this.openCommentDislikedPopup();
    }, 10);
  }

  onEditComment(event: {comment: Comment, newContent: string}) {
    this.communityService.updateComment(
      event.comment.comment_id, 
      event.newContent
    );
    this.openCommentEditedPopup();
  }

  onDeleteComment(comment: Comment) {
    this.communityService.deleteComment(comment.comment_id);
    this.openCommentDeletedPopup();
  }

  getCommentsForPost(postId: string): Comment[] {
    return this.communityService.getCommentsForPost(postId);
  }

  // Popup alert methods
  openCommentAddedPopup() {
    this.isCommentAddedPopupOpen = true;
  }

  closeCommentAddedPopup() {
    this.isCommentAddedPopupOpen = false;
  }

  openCommentEditedPopup() {
    this.isCommentEditedPopupOpen = true;
  }

  closeCommentEditedPopup() {
    this.isCommentEditedPopupOpen = false;
  }

  openCommentDeletedPopup() {
    this.isCommentDeletedPopupOpen = true;
  }

  closeCommentDeletedPopup() {
    this.isCommentDeletedPopupOpen = false;
  }

  openPostEditedPopup() {
    this.isPostEditedPopupOpen = true;
  }

  closePostEditedPopup() {
    this.isPostEditedPopupOpen = false;
  }

  openPostDeletedPopup() {
    this.isPostDeletedPopupOpen = true;
  }

  closePostDeletedPopup() {
    this.isPostDeletedPopupOpen = false;
  }

  openPostLikedPopup() {
    this.isPostLikedPopupOpen = true;
  }

  closePostLikedPopup() {
    this.isPostLikedPopupOpen = false;
  }

  openPostDislikedPopup() {
    this.isPostDislikedPopupOpen = true;
  }

  closePostDislikedPopup() {
    this.isPostDislikedPopupOpen = false;
  }

  openCommentLikedPopup() {
    this.isCommentLikedPopupOpen = true;
  }

  closeCommentLikedPopup() {
    this.isCommentLikedPopupOpen = false;
  }

  openCommentDislikedPopup() {
    this.isCommentDislikedPopupOpen = true;
  }

  closeCommentDislikedPopup() {
    this.isCommentDislikedPopupOpen = false;
  }
}