import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../../../../services/community.service';
import { Comment } from '../../../../../models/comment.model';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-section.html',
  styleUrl: './comment-section.scss'
})
export class CommentSection {
  @Input() postId: string = ''; 
  newCommentText: string = '';
  currentUserId: string = 'currentUser';

  constructor(public communityService: CommunityService) {}

  onSubmitComment() {
    if (this.newCommentText.trim() && this.postId) {
      this.communityService.addComment(this.postId, this.newCommentText);
      this.newCommentText = '';
    }
  }

  onRateComment(commentId: string, rating: number) {
    if (this.postId) {
      this.communityService.rateComment(commentId, this.currentUserId, rating);
    }
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0);
  }

  getComments(): Comment[] {
    return this.communityService.getComments(this.postId);
  }

  getCommentRating(commentId: string): number {
    return this.communityService.getRating(commentId, this.currentUserId);
  }
}