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

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() likePost = new EventEmitter<void>();
  @Output() dislikePost = new EventEmitter<void>();
  @Output() addComment = new EventEmitter<string>();
  @Output() likeComment = 
    new EventEmitter<{comment: Comment, isReply: boolean}>();
  @Output() dislikeComment = 
    new EventEmitter<{comment: Comment, isReply: boolean}>();

  newCommentText: string = '';
  replyingTo?: { comment: Comment, isReply: boolean };
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
}
