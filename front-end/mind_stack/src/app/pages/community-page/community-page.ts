import { Component, ViewChildren, QueryList, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../services/community.service';
import { PostCard } from './components/post-card/post-card/post-card';
import { Post, Comment } from '../../models/post.model';
import { Subject, takeUntil } from 'rxjs';
import { CreatePost } from './components/create-post/create-post';
import { Search } from './components/search/search';
import { PostModal } from './components/post-modal/post-modal';

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
  posts: Post[] = [];
  allComments: Comment[] = [];
  filteredPosts: Post[] = [];
  showCreateModal = false;
  showPostModal = false;
  selectedPost: Post | null = null;
  editingPost: Post | null = null;
  searchQuery = '';
  currentUserInitial = 'J';
  isSidebarCollapsed = false;

  private destroy$ = new Subject<void>();

  constructor(private communityService: CommunityService) {}

  ngOnInit() {
    this.subscribeToUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

  onDeletePost(post: Post) {
    this.communityService.deletePost(post.post_id);
  }

  onEditPost(post: Post) {
    this.editingPost = post;
    this.showCreateModal = true;
  }

  onAddComment(content: string) {
    if (this.selectedPost) {
      this.communityService.createComment(this.selectedPost.post_id, content);
    }
  }

  onLikeComment(event: {comment: Comment, isReply: boolean}) {
    this.communityService.toggleLikeComment(event.comment.comment_id);
  }

  onDislikeComment(event: {comment: Comment, isReply: boolean}) {
    this.communityService.toggleDislikeComment(event.comment.comment_id);
  }

  getCommentsForPost(postId: string): Comment[] {
    return this.communityService.getCommentsForPost(postId);
  }
}