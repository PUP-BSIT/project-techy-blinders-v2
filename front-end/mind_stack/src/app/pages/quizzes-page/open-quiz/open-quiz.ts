import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionItem, Quiz } from '../quizzes-page';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-open-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './open-quiz.html',
  styleUrls: ['./open-quiz.scss']
})
export class OpenQuiz implements OnInit {
  quiz = signal<Quiz | null>(null);
  currentIndex = signal(0);
  isAnswerRevealed = signal(false);
  selectedAnswer = signal<string>('');

  options: string[] = ['A', 'B', 'C', 'D']; // no working for now

  private readonly STORAGE_KEY = 'quizzes';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadQuiz(id);
  }

  // load quuiz
  private getQuizzesFromStorage(): Quiz[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return parsed.map((q: any) => ({
      ...q,
      created_at: new Date(q.created_at)
    }));
  }

  loadQuiz(id: number) {
    const quizzes = this.getQuizzesFromStorage();
    const found = quizzes.find(q => q.quiz_id === id) || null;
    this.quiz.set(found);
  }

  currentQuestion = computed<QuestionItem | null>(() => {
    const q = this.quiz();
    if (!q || q.questions.length === 0) return null;
    return q.questions[this.currentIndex()];
  });

  totalQuestions = computed(() => {
    return this.quiz()?.questions.length || 0;
  });

  nextQuestion() {
    const q = this.quiz();
    if (!q) return;

    if (this.currentIndex() < q.questions.length - 1) {
      this.currentIndex.update(i => i + 1);
      this.isAnswerRevealed.set(false);
      this.selectedAnswer.set('');
    }
  }

  previousQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      this.isAnswerRevealed.set(false);
      this.selectedAnswer.set('');
    }
  }

  selectAnswer(option: string) {
    if (!this.isAnswerRevealed()) {
      this.selectedAnswer.set(option);
    }
  }

  revealAnswer() {
    this.isAnswerRevealed.set(true);
  }

  goBack() {
    this.router.navigate(['/app/quizzes']);
  }
}