import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Post, Comment } from '../../../../models/post.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './post-modal.html',
  styleUrl: './post-modal.scss'
})
export class PostModal implements OnInit, OnDestroy, OnChanges {
  @Input() post!: Post;
  @Input() comments: Comment[] = [];
  @Input() currentUserInitial: string = 'J';
  @Input() currentUserId: string = '';
  @Input() now?: Date;
  @Input() focusCommentId?: string;
  
  private updateInterval: any;
  currentTime = new Date();

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() likePost = new EventEmitter<void>();
  @Output() dislikePost = new EventEmitter<void>();
  @Output() editPost = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<Post>();
  @Output() addComment = new EventEmitter<string>();
  @Output() likeComment = 
    new EventEmitter<{comment: Comment, isReply: boolean}>();
  @Output() dislikeComment = 
    new EventEmitter<{comment: Comment, isReply: boolean}>();
  @Output() editComment = 
    new EventEmitter<{comment: Comment, newContent: string}>();
  @Output() deleteComment = new EventEmitter<Comment>();

  newCommentText: string = '';
  replyingTo?: { comment: Comment, isReply: boolean };
  editingComment?: Comment;
  editCommentText: string = '';
  showMenuForComment?: string;
  showDeleteConfirmForComment?: string;
  showPostMenu = false;
  showDeleteConfirmForPost = false;
  @ViewChild('replyInput') replyInputRef?: ElementRef<HTMLInputElement>;

  ngOnInit() {
    this.currentTime = this.now ?? new Date();
    // Update time display frequently to avoid stale minutes
    this.updateInterval = setInterval(() => {
      this.currentTime = this.now ?? new Date();
    }, 15000);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['now'] && this.now) {
      this.currentTime = this.now;
    }
    const shouldFocusComment = (changes['focusCommentId'] && this.focusCommentId) || (changes['comments'] && this.focusCommentId);
    if (shouldFocusComment) {
      // Attempt multiple times to ensure the DOM has rendered
      const targetId = this.focusCommentId!;
      setTimeout(() => this.scrollToComment(targetId), 0);
      setTimeout(() => this.scrollToComment(targetId), 50);
      requestAnimationFrame(() => this.scrollToComment(targetId));
    }
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  getInitial(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  getTimeAgo(date: Date): string {
    const diffMs = Math.max(0, this.currentTime.getTime() - new Date(date).getTime());
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (seconds < 60) return 'Just Now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  onLike() {
    this.likePost.emit();
  }

  onDislike() {
    this.dislikePost.emit();
  }

  togglePostMenu(event: Event) {
    event.stopPropagation();
    this.showPostMenu = !this.showPostMenu;
  }

  onEditPost(event: Event) {
    event.stopPropagation();
    this.editPost.emit(this.post);
    this.showPostMenu = false;
  }

  onDeletePost(event: Event) {
    event.stopPropagation();
    this.showDeleteConfirmForPost = true;
  }

  confirmDeletePost(event: Event) {
    event.stopPropagation();
    this.deletePost.emit(this.post);
    this.showDeleteConfirmForPost = false;
    this.showPostMenu = false;
  }

  cancelDeletePost(event: Event) {
    event.stopPropagation();
    this.showDeleteConfirmForPost = false;
  }

  onAddComment() {
    if (this.newCommentText.trim()) {
      this.addComment.emit(this.newCommentText);
      this.newCommentText = '';
    }
  }

  onLikeComment(comment: Comment, isReply: boolean) {
    this.likeComment.emit({ comment, isReply });
  }

  onDislikeComment(comment: Comment, isReply: boolean) {
    this.dislikeComment.emit({ comment, isReply });
  }

  onReply(comment: Comment, isReply: boolean) {
    this.replyingTo = { comment, isReply };
    // Only set mention if input is empty, don't append to existing text
    if (!this.newCommentText.trim()) {
      this.newCommentText = `@${comment.username} `;
    }
    queueMicrotask(() => this.replyInputRef?.nativeElement?.focus());
  }

  isCommentOwner(comment: Comment): boolean {
    return comment.user_id === this.currentUserId;
  }

  isPostOwner(): boolean {
    return this.post.user_id === this.currentUserId;
  }

  toggleCommentMenu(event: Event, commentId: string) {
    event.stopPropagation();
    this.showMenuForComment = 
      this.showMenuForComment === commentId ? undefined : commentId;
  }

  onEditComment(event: Event, comment: Comment) {
    event.stopPropagation();
    this.editingComment = comment;
    this.editCommentText = comment.content;
    this.showMenuForComment = undefined;
  }

  onSaveEdit(comment: Comment) {
    if (this.editCommentText.trim()) {
      this.editComment.emit({ 
        comment, 
        newContent: this.editCommentText 
      });
      this.editingComment = undefined;
      this.editCommentText = '';
    }
  }

  onCancelEdit() {
    this.editingComment = undefined;
    this.editCommentText = '';
  }

  onDeleteComment(event: Event, comment: Comment) {
    event.stopPropagation();
    this.showDeleteConfirmForComment = comment.comment_id;
  }

  confirmDeleteComment(event: Event, comment: Comment) {
    event.stopPropagation();
    this.deleteComment.emit(comment);
    this.showDeleteConfirmForComment = undefined;
    this.showMenuForComment = undefined;
  }

  cancelDeleteComment(event: Event) {
    event.stopPropagation();
    this.showDeleteConfirmForComment = undefined;
  }

  private scrollToComment(commentId: string) {
    const el = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (el) {
      el.classList.add('highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Remove highlight after a short delay
      setTimeout(() => el.classList.remove('highlight'), 1500);
    }
  }
}
