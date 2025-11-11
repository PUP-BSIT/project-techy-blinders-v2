import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../../../../services/community.service';
import { Comment } from '../../../../../shared/interfaces/community.interface';

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

  constructor(public communityService: CommunityService) {}

  onSubmitComment() {
    if (this.newCommentText.trim() && this.postId) {
      this.communityService.addComment(this.postId, this.newCommentText);
      this.newCommentText = '';
    }
  }

  onRateComment(commentId: string, rating: number) {
    if (this.postId) {
      this.communityService.rateComment(this.postId, commentId, rating);
    }
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0);
  }

  getComments(): Comment[] {
    const post = this.communityService.posts.find(p => p.id === this.postId);
    return post ? post.comments : [];
  }
}