import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnDestroy, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post } from '../../../../../models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss'
})
export class PostCard implements OnInit, OnDestroy, OnChanges {
   @Input() post!: Post;
  @Input() currentUserInitial: string = 'J';
  @Input() currentUserId: string = '';
  @Input() now?: Date;
  
  private router = inject(Router);
  private updateInterval: any;
  currentTime = new Date();
  
  @Output() openModal = new EventEmitter<Post>();
  @Output() likePost = new EventEmitter<Post>();
  @Output() dislikePost = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<{ post: Post; setPrivate: boolean; permanent: boolean }>();
  @Output() editPost = new EventEmitter<Post>();

  showMenu = false;
  showDeleteConfirm = false;

  ngOnInit() {
    this.currentTime = this.now ?? new Date();
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
    const diffMs = Math.max(0, this.currentTime.getTime() - new Date(date).getTime());
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
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

  confirmUnpublish(event: Event) {
    event.stopPropagation();
    this.showMenu = false;
    this.showDeleteConfirm = false;
    this.deletePost.emit({ post: this.post, setPrivate: true, permanent: false });
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

  goToUserProfile(event: Event, userId: string) {
    event.stopPropagation();
    if (!userId) {
      return;
    }

    const target = userId === this.currentUserId
      ? ['/app/user-profile']
      : ['/app/user-profile', userId];

    this.router.navigate(target);
  }

  onCommentClick(event: Event) {
    event.stopPropagation();
    // Comment should open the post modal (discussion), not navigate to the set
    this.openModal.emit(this.post);
  }

  onPlayClick(event: Event) {
    event.stopPropagation();
    if (this.isQuizPost()) {
      this.playQuiz(event);
    } else if (this.isFlashcardPost()) {
      this.playFlashcard(event);
    } else {
      // If not a linked set, fallback to opening the post modal
      this.openModal.emit(this.post);
    }
  }

  isQuizPost(): boolean {
    return this.post.slug?.startsWith('quiz-') || false;
  }

  isFlashcardPost(): boolean {
    return this.post.slug?.startsWith('flashcard-') || false;
  }

  playQuiz(event: Event) {
    event.stopPropagation();
    const match = this.post.slug?.match(/^quiz-(\d+)-/);
    if (match && match[1]) {
      const quizId = parseInt(match[1], 10);
      this.router.navigate(['/app/quizzes', quizId]);
    }
  }

  playFlashcard(event: Event) {
    event.stopPropagation();
    const match = this.post.slug?.match(/^flashcard-(\d+)-/);
    if (match && match[1]) {
      const flashcardId = parseInt(match[1], 10);
      this.router.navigate(['/app/study-sets', flashcardId]);
    }
  }

  getOriginalTitle(): string {
    if (this.isQuizPost() || this.isFlashcardPost()) {
      const parts = this.post.content?.split(' • ') || [];
      if (parts.length > 0) {
        return parts[0];
      }
    }
    return this.post.title;
  }

  getSubtitle(): string {
    if (this.isQuizPost() || this.isFlashcardPost()) {
      const parts = this.post.content?.split(' • ') || [];
      if (parts.length > 1) {
        return parts.slice(1).join(' • ');
      }
    }
    return this.post.content || '';
  }
}