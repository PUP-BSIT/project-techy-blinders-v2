import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizzesService, Quiz, QuestionType } from '../../../services/quizzes.service';

@Component({
  selector: 'app-open-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './open-quiz.html',
  styleUrl: './open-quiz.scss'
})
export class OpenQuiz implements OnInit, OnDestroy {
  quiz: Quiz | undefined;
  currentQuestionIndex: number = 0;
  selectedAnswer: string | null = null;
  timeRemaining: number = 900;
  totalTime: number = 900;
  timerInterval: any;
  answers: Map<number, string> = new Map();

  QuestionType = QuestionType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizzesService: QuizzesService
  ) {}

  ngOnInit() {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.quiz = this.quizzesService.getQuizById(quizId);
    
    if (!this.quiz) {
      this.router.navigate(['/app/quizzes']);
      return;
    }

    const savedProgress = localStorage.getItem(`quiz_progress_${quizId}`);
    if (savedProgress) {
      this.currentQuestionIndex = Number(savedProgress);
    }

    const savedTimer = localStorage.getItem(`quiz_timer_${quizId}`);
    if (savedTimer) {
      this.timeRemaining = Number(savedTimer);
    }

    const savedAnswers = localStorage.getItem(`quiz_answers_${quizId}`);
    if (savedAnswers) {
      this.answers = new Map(JSON.parse(savedAnswers));
      this.loadAnswer();
    }

    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
        this.saveProgress();
      } else {
        this.submitQuiz();
      }
    }, 1000);
  }

  get currentQuestion() {
    return this.quiz?.questions[this.currentQuestionIndex];
  }

  get progress() {
    if (!this.quiz) return 0;
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  selectAnswer(answer: string) {
    this.selectedAnswer = answer;
    this.answers.set(this.currentQuestionIndex, answer);
    this.saveProgress();
  }

  submitAnswer() {
    if (this.selectedAnswer !== null) {
      this.answers.set(this.currentQuestionIndex, this.selectedAnswer);
      this.nextQuestion();
    }
  }

  skipQuestion() {
    this.nextQuestion();
  }

  nextQuestion() {
    if (!this.quiz) return;
    
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
      this.loadAnswer();
    } else {
      this.submitQuiz();
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.loadAnswer();
    }
  }

  loadAnswer() {
    this.selectedAnswer = this.answers.get(this.currentQuestionIndex) || null;
  }

  saveProgress() {
    if (this.quiz) {
      localStorage.setItem(`quiz_answers_${this.quiz.quiz_id}`, JSON.stringify(Array.from(this.answers.entries())));
      localStorage.setItem(`quiz_progress_${this.quiz.quiz_id}`, this.currentQuestionIndex.toString());
      localStorage.setItem(`quiz_timer_${this.quiz.quiz_id}`, this.timeRemaining.toString());
    }
  }

  submitQuiz() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.quiz) {
      localStorage.removeItem(`quiz_answers_${this.quiz.quiz_id}`);
      localStorage.removeItem(`quiz_progress_${this.quiz.quiz_id}`);
      localStorage.removeItem(`quiz_timer_${this.quiz.quiz_id}`);
    }
    this.router.navigate(['/app/quizzes']);
  }

  goBack() {
    this.router.navigate(['/app/quizzes']);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }
}