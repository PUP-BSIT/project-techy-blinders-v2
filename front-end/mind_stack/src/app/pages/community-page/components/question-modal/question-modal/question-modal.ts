import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../../../../services/community.service';

@Component({
  selector: 'app-question-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-modal.html',
  styleUrl: './question-modal.scss'
})
export class QuestionModal {
  title: string = '';
  content: string = '';

  constructor(public communityService: CommunityService) {}

  onClose() {
    this.title = '';
    this.content = '';
    this.communityService.closeModal();
  }

  onSubmit() {
    if (this.title.trim()) {
      this.communityService.addPost({
        title: this.title,
        content: this.content
      });
      this.title = '';
      this.content = '';
    }
  }

  onSaveDraft() {
    this.communityService.saveDraft({
      title: this.title,
      content: this.content
    });
    this.title = '';
    this.content = '';
  }
}