import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../../../models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss'
})
export class PostCard {
   @Input() post!: Post;
  @Input() currentUserInitial: string = 'J';
  @Input() currentUserId: string = '';
  
  @Output() openModal = new EventEmitter<Post>();
  @Output() likePost = new EventEmitter<Post>();
  @Output() dislikePost = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<Post>();
  @Output() editPost = new EventEmitter<Post>();

  showMenu = false;
  showDeleteConfirm = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.showMenu = false;
  }

  isPostOwner(): boolean {
    return this.post.user_id === this.currentUserId;
  }

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

  onCardClick() {
    this.openModal.emit(this.post);
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.showMenu = false;
    this.editPost.emit(this.post);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.showDeleteConfirm = true;
  }

  confirmDelete(event: Event) {
    event.stopPropagation();
    this.showMenu = false;
    this.showDeleteConfirm = false;
    this.deletePost.emit(this.post);
  }

  cancelDelete(event: Event) {
    event.stopPropagation();
    this.showDeleteConfirm = false;
  }

  onLike(event: Event) {
    event.stopPropagation();
    this.likePost.emit(this.post);
  }

  onDislike(event: Event) {
    event.stopPropagation();
    this.dislikePost.emit(this.post);
  }

  onCommentClick(event: Event) {
    event.stopPropagation();
    this.openModal.emit(this.post);
  }
}