import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { Post, Comment } from '../../../../models/post.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './post-modal.html',
  styleUrl: './post-modal.scss'
})
export class PostModal {
  @Input() post!: Post;
  @Input() comments: Comment[] = [];
  @Input() currentUserInitial: string = 'J';
  @Input() currentUserId: string = '';

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

  getInitial(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    return `${hours} hours ago`;
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
    const mention = `@${comment.username} `;
    if (!this.newCommentText.startsWith(mention)) {
      this.newCommentText = mention + this.newCommentText;
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
}
