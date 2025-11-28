import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentSection } from '../../comment-section/comment-section/comment-section';
import { CommunityService } from '../../../../../services/community.service';
import { Post } from '../../../../../models/blog.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, CommentSection],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss'
})
export class PostCard {
  @Input() post!: Post;

  constructor(public communityService: CommunityService) {}

  onToggleComments() {
    this.communityService.toggleComments(this.post.id);
  }

  onQuizClick() {
    this.communityService.handleQuizClick(this.post.id);
  }
}