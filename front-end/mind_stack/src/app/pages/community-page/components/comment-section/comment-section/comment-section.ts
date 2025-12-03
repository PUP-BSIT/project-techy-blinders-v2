import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../../../../models/post.model';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-section.html',
  styleUrl: './comment-section.scss'
})
export class CommentSection {
  @Input() comments: Comment[] = [];
  @Input() postId: string = '';
  @Input() currentUserInitial: string = 'J';
  
  @Output() addComment = new EventEmitter<string>();
  @Output() likeComment = new EventEmitter<Comment>();
  @Output() dislikeComment = new EventEmitter<Comment>();

  newCommentText: string = '';

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

  onAddComment() {
    if (this.newCommentText.trim()) {
      this.addComment.emit(this.newCommentText);
      this.newCommentText = '';
    }
  }

  onLikeComment(comment: Comment) {
    this.likeComment.emit(comment);
  }

  onDislikeComment(comment: Comment) {
    this.dislikeComment.emit(comment);
  }
}