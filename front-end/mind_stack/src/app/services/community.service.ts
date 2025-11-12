import { Injectable } from '@angular/core';
import { Post, QuestionData, Comment } from '../shared/interfaces/community.interface';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
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

  showQuestionModal: boolean = false;

  openModal() {
    this.showQuestionModal = true;
  }

  closeModal() {
    this.showQuestionModal = false;
  }

  addPost(data: QuestionData) {
    const newPost: Post = {
      id: Date.now().toString(),
      userId: 'currentUser',
      userName: 'John Doe',
      title: data.title,
      content: data.content,
      timestamp: new Date(),
      comments: [],
      showComments: false
    };

    this.posts.unshift(newPost);
    this.closeModal();
  }

  saveDraft(data: QuestionData) {
    console.log('Draft saved:', data);
  }

  toggleComments(postId: string) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.showComments = !post.showComments;
    }
  }

  addComment(postId: string, commentText: string) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: 'currentUser',
        userName: 'John Doe',
        content: commentText,
        timestamp: new Date(),
        rating: 0
      } as Comment;

      post.comments.push(newComment);
    }
  }

  rateComment(postId: string, commentId: string, rating: number) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      const comment = post.comments.find(c => c.id === commentId);
      if (comment) {
        comment.rating = rating;
      }
    }
  }

  handleQuizClick(postId: string) {
    console.log('Quiz clicked for post:', postId);
  }
}