import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  rating: number;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  timestamp: Date;
  comments: Comment[];
  showComments: boolean;
  quizTitle?: string;
  flashcardCount?: number;
}

@Component({
  selector: 'app-community-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-page.html',
  styleUrl: './community-page.scss'
})
export class CommunityPage {
  newQuestionText: string = '';
  newCommentText: string = '';
  activeCommentPostId: string = '';
  
  showQuestionModal: boolean = false;
  modalTitle: string = '';
  modalContent: string = '';

  posts: Post[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      title: 'What is Lorem Ipsum?',
      content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
      timestamp: new Date(),
      comments: [],
      showComments: false
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'John Doe',
      title: 'Can you answer this?',
      content: '',
      timestamp: new Date(),
      comments: [],
      showComments: false,
      quizTitle: 'TITLE FOR QUIZ',
      flashcardCount: 24
    }
  ];

  openQuestionModal() {
    this.showQuestionModal = true;
    this.modalTitle = '';
    this.modalContent = '';
  }

  closeQuestionModal() {
    this.showQuestionModal = false;
    this.modalTitle = '';
    this.modalContent = '';
  }

  askQuestion() {
    if (this.modalTitle.trim()) {
      const newPost: Post = {
        id: Date.now().toString(),
        userId: 'currentUser',
        userName: 'John Doe',
        title: this.modalTitle,
        content: this.modalContent,
        timestamp: new Date(),
        comments: [],
        showComments: false
      };

      this.posts.unshift(newPost);
      this.closeQuestionModal();
    }
  }

  toggleComments(postId: string) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.showComments = !post.showComments;
      this.activeCommentPostId = post.showComments ? postId : '';
      this.newCommentText = '';
    }
  }

  submitComment(postId: string) {
    if (this.newCommentText.trim()) {
      const post = this.posts.find(p => p.id === postId);
      if (post) {
        const newComment: Comment = {
          id: Date.now().toString(),
          userId: 'currentUser',
          userName: 'John Doe',
          content: this.newCommentText,
          timestamp: new Date(),
          rating: 0
        };

        post.comments.push(newComment);
        this.newCommentText = '';
      }
    }
  }

  rateComment(post: Post, comment: Comment, rating: number) {
    comment.rating = rating;
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0);
  }
}