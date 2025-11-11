import { Component, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../services/community.service';
import { QuestionModal } from './components/question-modal/question-modal/question-modal';
import { PostCard } from './components/post-card/post-card/post-card';

@Component({
  selector: 'app-community-page',
  standalone: true,
  imports: [CommonModule, FormsModule, QuestionModal, PostCard],
  templateUrl: './community-page.html',
  styleUrl: './community-page.scss'
})
export class CommunityPage implements AfterViewInit {
  @ViewChildren(PostCard) postCards!: QueryList<PostCard>;

  constructor(public communityService: CommunityService) {}

  ngAfterViewInit() {
    this.updatePostCards();
    
    this.postCards.changes.subscribe(() => {
      this.updatePostCards();
    });
  }

  private updatePostCards() {
    setTimeout(() => {
      this.postCards.forEach((postCard, index) => {
        if (this.communityService.posts[index]) {
          postCard.post = this.communityService.posts[index];
        }
      });
    });
  }
}