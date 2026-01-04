import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionItem, Quiz } from '../quizzes-page';
import { FormsModule } from '@angular/forms';
import { QuizzesService, QuizType, QuestionType } from '../../../../service/quizzes.service';
import { ActivityService } from '../../../../service/activity.service';
import { AuthService } from '../../../../service/auth.service';
import { QuizAttemptResponse } from '../../../models/attempt.model';

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
  userAnswers = signal<Map<number, string>>(new Map());

  scoreModalOpen = signal(false);
  isLoading = signal(false);
  latestAttempt = signal<QuizAttemptResponse | null>(null);

  private quizzesService = inject(QuizzesService);
  private activityService = inject(ActivityService);
  private authService = inject(AuthService);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadQuiz(id);
  }

  loadQuiz(id: number) {
    this.isLoading.set(true);
    this.quizzesService.getQuizSetById(id).subscribe({
      next: (quizSet) => {
        const quiz: Quiz = {
          quiz_id: quizSet.quiz_set_id || id,
          title: quizSet.title,
          description: quizSet.description,
          questions: quizSet.quizzes.map(q => ({
            quizId: q.quizId,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            answer: q.identificationAnswer
          })),
          questionType: quizSet.quiz_type === QuizType.MULTIPLE_CHOICE 
            ? QuestionType.MULTIPLE_CHOICE 
            : QuestionType.IDENTIFICATION,
          created_at: quizSet.created_at || new Date(),
          is_public: quizSet.is_public
        };

        this.quiz.set(quiz);
        this.isLoading.set(false);

        if (quiz) {
          this.answersCorrectness.set(new Array(quiz.questions.length).fill(false));
          this.showScoreButton.set(false);
          this.scoreVisible.set(false);
          this.loadLatestAttempt(id);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.quiz.set(null);
      }
    });
  }

  loadLatestAttempt(quizSetId: number) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return;
    }

    this.quizzesService.getLatestQuizAttempt(currentUser.userId, quizSetId).subscribe({
      next: (attempt) => {
        this.latestAttempt.set(attempt);
      },
      error: (error) => {
        console.error('Error loading latest attempt:', error);
        this.latestAttempt.set(null);
      }
    });
  }

  currentQuestion = computed<QuestionItem | null>(() => {
    const q = this.quiz();
    if (!q || q.questions.length === 0) return null;
    return q.questions[this.currentIndex()];
  });

  totalQuestions = computed(() => {
    return this.quiz()?.questions.length || 0;
  });

  isMultipleChoice = computed(() => {
    const q = this.currentQuestion();
    return !!(q?.optionA && q?.optionB && q?.optionC && q?.optionD);
  });

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

    const quiz = this.quiz();
    if (quiz && quiz.questions[index]) {
      const userAnswer = this.isMultipleChoice() ? this.selectedAnswer() : this.userTypedAnswer();
      const answers = new Map(this.userAnswers());
      answers.set(index, userAnswer);
      this.userAnswers.set(answers);
    }

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
    this.submitQuizAttempt();
  }

  submitQuizAttempt() {
    const currentUser = this.authService.getCurrentUser();
    const quiz = this.quiz();
    
    if (!currentUser || !currentUser.userId || !quiz) {
      return;
    }

    const answers = [];
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const quizId = question.quizId;
      
      if (!quizId) {
        console.error(`Quiz ID not found for question at index ${i}`);
        continue;
      }
      
      const userAnswer = this.userAnswers().get(i) || '';
      answers.push({
        quizId: quizId,
        userAnswer: userAnswer
      });
    }

    const request = {
      userId: currentUser.userId,
      quizSetId: quiz.quiz_id,
      answers: answers
    };

    this.quizzesService.submitQuizAttempt(request).subscribe({
      next: (response) => {
        console.log('Quiz attempt submitted successfully:', response);
        this.latestAttempt.set(response);
        
        // Add activity after successful submission
        if (quiz) {
          this.activityService.addActivity({
            type: 'quiz',
            title: quiz.title,
            description: quiz.description,
            quizSetId: quiz.quiz_id,
            score: {
              totalScore: response.totalScore,
              maxScore: response.maxScore,
              percentage: response.percentage
            }
          });
        }
      },
      error: (error) => {
        console.error('Error submitting quiz attempt:', error);
      }
    });
  }

  closeScoreModal() {
    this.scoreModalOpen.set(false);
  }
 
retakeQuiz() {
  this.currentIndex.set(0);

  const total = this.totalQuestions();
  this.answersCorrectness.set(new Array(total).fill(false));
  this.userAnswers.set(new Map());

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