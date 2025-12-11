import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../../../../models/post.model';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-section.html',
  styleUrl: './comment-section.scss'
})
export class CommentSection implements OnInit, OnDestroy, OnChanges {
  @Input() comments: Comment[] = [];
  @Input() postId: string = '';
  @Input() currentUserInitial: string = 'J';
  @Input() now?: Date;
  
  private updateInterval: any;
  currentTime = new Date();
  
  @Output() addComment = new EventEmitter<string>();
  @Output() likeComment = new EventEmitter<Comment>();
  @Output() dislikeComment = new EventEmitter<Comment>();

  newCommentText: string = '';

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