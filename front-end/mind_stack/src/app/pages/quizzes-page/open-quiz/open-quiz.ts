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
  userTypedAnswer = signal<string>('');

  scoreVisible = signal(false);
  answersCorrectness = signal<boolean[]>([]);
  showScoreButton = signal(false);

  scoreModalOpen = signal(false);

  private readonly STORAGE_KEY = 'quizzes';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadQuiz(id);
  }

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

    if (found) {
      this.answersCorrectness.set(new Array(found.questions.length).fill(false));
      this.showScoreButton.set(false);
      this.scoreVisible.set(false);
    }
  }

  currentQuestion = computed<QuestionItem | null>(() => {
    const q = this.quiz();
    if (!q || q.questions.length === 0) return null;
    return q.questions[this.currentIndex()];
  });

  totalQuestions = computed(() => {
    return this.quiz()?.questions.length || 0;
  });

  // is current question is multiple choice?
  isMultipleChoice = computed(() => {
    const q = this.currentQuestion();
    return !!(q?.optionA && q?.optionB && q?.optionC && q?.optionD);
  });

  // is current question is identification?
  isIdentification = computed(() => {
    const q = this.currentQuestion();
    return !!q?.answer && !this.isMultipleChoice();
  });

  isCorrect = computed(() => {
    const q = this.currentQuestion();
    if (!q || !this.isAnswerRevealed()) return false;

    if (this.isMultipleChoice()) {
      return this.selectedAnswer().toUpperCase() === q.correctAnswer?.toUpperCase();
    } else if (this.isIdentification()) {
      return this.userTypedAnswer().trim().toLowerCase() === q.answer?.trim().toLowerCase();
    }
    return false;
  });

  nextQuestion() {
    const q = this.quiz();
    if (!q) return;

    if (this.currentIndex() < q.questions.length - 1) {
      this.currentIndex.update(i => i + 1);
      this.resetQuestionState();
    }
  }

  previousQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      this.resetQuestionState();
    }
  }

  private resetQuestionState() {
    this.isAnswerRevealed.set(false);
    this.selectedAnswer.set('');
    this.userTypedAnswer.set('');
  }

  selectAnswer(option: string) {
    if (!this.isAnswerRevealed()) {
      this.selectedAnswer.set(option);
    }
  }

  revealAnswer() {
    if (this.isMultipleChoice() && !this.selectedAnswer()) return;
    if (this.isIdentification() && !this.userTypedAnswer().trim()) return;

    this.isAnswerRevealed.set(true);

    const isCorrect = this.isCorrect();
    const index = this.currentIndex();
    const updated = [...this.answersCorrectness()];

    updated[index] = isCorrect;
    this.answersCorrectness.set(updated);

    // show scorebutton will appear
    if (index === this.totalQuestions() - 1) {
      this.showScoreButton.set(true);
    }
  }

  totalCorrect = computed(() => {
    return this.answersCorrectness().filter(x => x === true).length;
  });

  toggleScore() {
    this.scoreVisible.update(v => !v);
  }

  openScoreModal() {
    this.scoreModalOpen.set(true);
  }

  closeScoreModal() {
    this.scoreModalOpen.set(false);
  }
 
retakeQuiz() {
  this.currentIndex.set(0);

  const total = this.totalQuestions();
  this.answersCorrectness.set(new Array(total).fill(false));

  this.isAnswerRevealed.set(false);
  this.selectedAnswer.set('');
  this.userTypedAnswer.set('');

  this.showScoreButton.set(false);
  this.scoreModalOpen.set(false);
}
  
  goBack() {
    this.router.navigate(['/app/quizzes']);
  }
}