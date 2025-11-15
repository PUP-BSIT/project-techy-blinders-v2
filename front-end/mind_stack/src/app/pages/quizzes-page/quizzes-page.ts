import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddQuiz } from './add-quiz/add-quiz';
import { QuizzesService, Quiz } from '../../services/quizzes.service';

interface QuizSet {
  quiz_id: number;
  title: string;
  questionCount: number;
  created_at: Date;
}

@Component({
  selector: 'app-quizzes-page',
  standalone: true,
  imports: [AddQuiz, CommonModule],
  templateUrl: './quizzes-page.html',
  styleUrls: ['./quizzes-page.scss']
})
export class QuizzesPage implements OnInit, AfterViewInit {
  isModalOpen: boolean = false;
  quizzes: QuizSet[] = [];
  lastQuiz: QuizSet | null = null;

  @ViewChild('quizzesContainer', { read: ViewContainerRef }) private quizzesContainer!: ViewContainerRef;
  @ViewChild('quizTpl') private quizTpl!: TemplateRef<any>;

  constructor(
    private router: Router,
    private quizzesService: QuizzesService
  ) {}

  ngOnInit() {
    this.loadQuizzes();
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderQuizzes());
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.loadQuizzes();
  }

  loadQuizzes() {
    const allQuizzes = this.quizzesService.getQuizzes();
    const quizSets: QuizSet[] = allQuizzes.map(quiz => ({
      quiz_id: quiz.quiz_id,
      title: quiz.title,
      questionCount: quiz.questions.length,
      created_at: quiz.created_at
    }));

    const lastAccessedQuizId = localStorage.getItem('lastAccessedQuizId');
    if (lastAccessedQuizId) {
      const lastAccessedQuiz = quizSets.find(q => q.quiz_id === Number(lastAccessedQuizId));
      if (lastAccessedQuiz) {
        this.lastQuiz = lastAccessedQuiz;
        this.quizzes = quizSets.filter(q => q.quiz_id !== this.lastQuiz!.quiz_id);
        this.renderQuizzes();
        return;
      }
    }

    this.lastQuiz = null;
    this.quizzes = quizSets;
    this.renderQuizzes();
  }

  private renderQuizzes() {
    if (!this.quizzesContainer || !this.quizTpl) return;
    this.quizzesContainer.clear();
    for (let i = 0; i < this.quizzes.length; i++) {
      const quiz = this.quizzes[i];
      this.quizzesContainer.createEmbeddedView(this.quizTpl, { quiz, index: i });
    }
  }

  saveQuiz(quizData: { title: string; description: string; questions: any[]; questionType: any; isPublic: boolean }) {
    console.log('saveQuiz called with data:', quizData);

    if (!quizData || !quizData.title || !quizData.questions || quizData.questions.length === 0) {
      console.error('Invalid quiz data received:', quizData);
      alert('Error: Invalid quiz data. Please check your quiz and try again.');
      return;
    }

    const newQuiz: Quiz = {
      quiz_id: Date.now(),
      title: quizData.title,
      description: quizData.description || '',
      questions: quizData.questions,
      questionType: quizData.questionType,
      created_at: new Date(),
      is_public: quizData.isPublic || false
    };

    console.log('Creating new quiz:', newQuiz);
    this.quizzesService.addQuiz(newQuiz);
    console.log('Quiz saved successfully');
    this.loadQuizzes();
    console.log('Quizzes reloaded, current count:', this.quizzes.length);
  }

  editQuiz(quizId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/app/quizzes', quizId]);
  }

  shareQuiz(quizId: number, event: Event) {
    event.stopPropagation();
    console.log('Share quiz:', quizId);
  }

  resumeQuiz(quizId?: number) {
    if (quizId == null) {
      console.warn('resumeQuiz called with undefined quizId');
      return;
    }
    localStorage.setItem('lastAccessedQuizId', quizId.toString());
    this.router.navigate(['/app/quizzes', quizId]);
  }

  openQuiz(quizId?: number) {
    if (quizId == null) {
      console.warn('openQuiz called with undefined quizId');
      return;
    }
    localStorage.setItem('lastAccessedQuizId', quizId.toString());
    this.router.navigate(['/app/quizzes', quizId]);
  }
}