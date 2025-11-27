import { Injectable } from '@angular/core';
import { Post, QuestionData } from '../models/community.model';
import { Comment } from '../models/comment.model';
import { Rating } from '../models/rating.model';

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
      commentCount: 0,
      showComments: false
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'John Doe',
      title: 'Can you answer this?',
      content: '',
      timestamp: new Date(),
      commentCount: 0,
      showComments: false,
      quizTitle: 'TITLE FOR QUIZ',
      flashcardCount: 24
    }
  ];

  private comments: Map<string, Comment[]> = new Map();
  private ratings: Map<string, Rating[]> = new Map();

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
      commentCount: 0,
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

  getComments(postId: string): Comment[] {
    return this.comments.get(postId) || [];
  }

  addComment(postId: string, commentText: string) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      const newComment: Comment = {
        comment_id: Date.now().toString(),
        content: commentText,
        user_id: 'currentUser',
        user_name: 'John Doe',
        created_at: new Date()
      };

      const postComments = this.comments.get(postId) || [];
      postComments.push(newComment);
      this.comments.set(postId, postComments);

      post.commentCount = postComments.length;
    }
  }

  getRating(commentId: string, userId: string): number {
    const commentRatings = this.ratings.get(commentId) || [];
    const userRating = commentRatings.find(r => r.user_id === userId);
    return userRating ? userRating.rating_value : 0;
  }

  rateComment(commentId: string, userId: string, ratingValue: number) {
    const commentRatings = this.ratings.get(commentId) || [];
    const existingRatingIndex = commentRatings.findIndex(r => r.user_id === userId);

    if (existingRatingIndex !== -1) {
      commentRatings[existingRatingIndex].rating_value = ratingValue;
    } else {
      const newRating: Rating = {
        rating_id: Date.now().toString(),
        comment_id: commentId,
        user_id: userId,
        rating_value: ratingValue,
        created_at: new Date()
      };
      commentRatings.push(newRating);
    }

    this.ratings.set(commentId, commentRatings);
  }

  handleQuizClick(postId: string) {
    console.log('Quiz clicked for post:', postId);
  }
}