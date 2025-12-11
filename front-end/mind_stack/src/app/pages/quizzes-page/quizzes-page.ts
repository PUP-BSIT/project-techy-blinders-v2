import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { QuizzesService, QuizType, QuizItem, QuestionType } from '../../../service/quizzes.service';
import { AuthService } from '../../../service/auth.service';

export interface QuestionItem {
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  answer?: string;
}

export interface Quiz {
  quiz_id: number;
  title: string;
  description?: string;
  questions: QuestionItem[];
  questionType: QuestionType;
  created_at: Date;
  is_public: boolean;
}

@Component({
  selector: 'app-quizzes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quizzes-page.html',
  styleUrls: ['./quizzes-page.scss']
})
export class QuizzesPage implements OnInit {
  isModalOpen: boolean = false;
  isQuestionModalOpen: boolean = false;
  isConfirmModalOpen: boolean = false;
  isPrivacyModalOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  isNotificationModalOpen: boolean = false;
  notificationTitle: string = '';
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'warning' = 'success';
  
  quizTitle: string = '';
  quizDescription: string = '';
  selectedQuestionType: QuestionType | '' = '';
  questions: QuestionItem[] = [];
  
  currentPage: number = 0;
  
  quizzesCurrentPage: number = 0;
  quizzesPerPage: number = 3;
  
  editingQuizId: number | null = null;
  selectedQuizIdForPrivacy: number | null = null;
  quizIdToDelete: number | null = null;

  QuestionType = QuestionType;

  isShareModalOpen: boolean = false;
  selectedQuizId: number | null = null;
  shareTitle: string = '';
  shareDescription: string = '';
  shareCategory: string = '';

  private quizzesService = inject(QuizzesService);
  private authService = inject(AuthService);
  isLoading: boolean = false;
  quizzesList: Quiz[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.loadQuizSetsFromBackend();
    
    this.route.queryParams.subscribe(params => {
      if (params['create'] === 'true') {
        this.openModal();
      }
    });
  }

  private loadQuizSetsFromBackend() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return;
    }

    this.isLoading = true;
    this.quizzesService.getQuizSetsByUserId(currentUser.userId).subscribe({
      next: (quizSets) => {
        const localQuizzes: Quiz[] = quizSets.map(qs => ({
          quiz_id: qs.quiz_set_id || Date.now(),
          title: qs.title,
          description: qs.description,
          questions: qs.quizzes.map(q => ({
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            answer: q.identificationAnswer
          })),
          questionType: qs.quiz_type === QuizType.MULTIPLE_CHOICE 
            ? QuestionType.MULTIPLE_CHOICE 
            : QuestionType.IDENTIFICATION,
          created_at: qs.created_at || new Date(),
          is_public: qs.is_public
        }));

        this.quizzesList = localQuizzes;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  get quizzes(): Quiz[] {
    return this.quizzesList;
  }

  get paginatedQuizzes(): Quiz[] {
    const startIndex = this.quizzesCurrentPage * this.quizzesPerPage;
    return this.quizzes.slice(startIndex, startIndex + this.quizzesPerPage);
  }

  get quizzesTotalPages(): number {
    return Math.ceil(this.quizzes.length / this.quizzesPerPage);
  }

  get quizzesPages(): (number | string)[] {
    const totalPages = this.quizzesTotalPages;
    const pages: (number | string)[] = [];

    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    pages.push(0, 1, 2);

    if (totalPages > 4) {
      pages.push('...');
    }

    if (totalPages > 3) {
      pages.push(totalPages - 1);
    }

    return pages;
  }

  goToQuizzesPage(page: number) {
    this.quizzesCurrentPage = page;
  }

  nextQuizzesPage() {
    if (this.quizzesCurrentPage < this.quizzesTotalPages - 1) {
      this.quizzesCurrentPage++;
    }
  }

  previousQuizzesPage() {
    if (this.quizzesCurrentPage > 0) {
      this.quizzesCurrentPage--;
    }
  }

  isPageNumber(page: number | string): boolean {
    return typeof page === 'number';
  }

  getPageNumber(page: number | string): number {
    return page as number;
  }

  getPageDisplay(page: number | string): string {
    return typeof page === 'number' ? String((page as number) + 1) : page as string;
  }

  openModal() {
    this.isModalOpen = true;
    this.quizTitle = '';
    this.quizDescription = '';
    this.selectedQuestionType = '';
    this.questions = [];
    this.currentPage = 0;
    this.editingQuizId = null;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isQuestionModalOpen = false;
    this.isConfirmModalOpen = false;
    this.quizTitle = '';
    this.quizDescription = '';
    this.selectedQuestionType = '';
    this.questions = [];
    this.currentPage = 0;
    this.editingQuizId = null;
  }

  openConfirmModal() {
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
  }

  confirmCancel() {
    this.isConfirmModalOpen = false;
    this.isModalOpen = false;
    this.isQuestionModalOpen = false;
  }

  addQuestion() {
    const newQuestion: QuestionItem = {
      question: ''
    };

    if (this.selectedQuestionType === QuestionType.MULTIPLE_CHOICE) {
      newQuestion.optionA = '';
      newQuestion.optionB = '';
      newQuestion.optionC = '';
      newQuestion.optionD = '';
      newQuestion.correctAnswer = '';
    } else if (this.selectedQuestionType === QuestionType.IDENTIFICATION) {
      newQuestion.answer = '';
    }

    this.questions.push(newQuestion);
    this.currentPage = Math.floor((this.questions.length - 1) / this.itemsPerPage);
  }

  deleteQuestion(index: number) {
    this.questions.splice(index, 1);
    const maxPage = Math.max(0, Math.ceil(this.questions.length / this.itemsPerPage) - 1);
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
  }

  onQuestionTypeChange() {
    this.questions = [];
    this.currentPage = 0;
  }

  setCorrectAnswer(question: QuestionItem, answer: string) {
    question.correctAnswer = answer;
  }

  get itemsPerPage(): number {
    return this.selectedQuestionType === QuestionType.IDENTIFICATION ? 3 : 2;
  }
  
  get paginatedQuestions() {
    const startIndex = this.currentPage * this.itemsPerPage;
    return this.questions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.questions.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  getActualIndex(localIndex: number): number {
    return this.currentPage * this.itemsPerPage + localIndex;
  }

  saveQuiz() {
    if (this.quizTitle.trim() && this.selectedQuestionType !== '') {
      this.isModalOpen = false;
      this.isQuestionModalOpen = true;
    }
  }

  saveQuizFromQuestionModal() {
    if (this.quizTitle.trim()) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser || !currentUser.userId) {
        this.showNotification('Login Required', 'Please log in to save your quiz sets.', 'warning');
        return;
      }

      if (this.questions.length === 0) {
        this.showNotification('Add Questions', 'Please add at least one question to your quiz set.', 'warning');
        return;
      }

      const incompleteQuestion = this.questions.find(q => {
        if (!q.question.trim()) return true;
        if (this.selectedQuestionType === QuestionType.MULTIPLE_CHOICE) {
          return !q.optionA?.trim() || !q.optionB?.trim() || 
                 !q.optionC?.trim() || !q.optionD?.trim() || !q.correctAnswer;
        } else {
          return !q.answer?.trim();
        }
      });

      if (incompleteQuestion) {
        this.showNotification('Complete Questions', 'Please fill in all question fields before saving.', 'warning');
        return;
      }

      this.isLoading = true;

      const quizType = this.selectedQuestionType === QuestionType.MULTIPLE_CHOICE 
        ? QuizType.MULTIPLE_CHOICE 
        : QuizType.IDENTIFICATION_ANSWER;

      const quizItems: QuizItem[] = this.questions.map(q => ({
        quizType: quizType,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        identificationAnswer: q.answer,
        points: 1
      }));

      if (this.editingQuizId !== null) {
        this.quizzesService.getQuizSetById(this.editingQuizId).subscribe({
          next: (existingQuizSet) => {
            const deleteObservables = existingQuizSet.quizzes.map((quiz: any) => 
              this.quizzesService.deleteQuiz(quiz.quizId)
            );

            if (deleteObservables.length > 0) {
              import('rxjs').then(rxjs => {
                rxjs.forkJoin(deleteObservables).subscribe({
                  next: () => {
                    this.updateQuizSetAndAddQuizzes(currentUser.userId, quizType, quizItems);
                  },
                  error: (error) => {
                    this.isLoading = false;
                  }
                });
              });
            } else {
              this.updateQuizSetAndAddQuizzes(currentUser.userId, quizType, quizItems);
            }
          },
          error: (error) => {
            this.isLoading = false;
          }
        });
      } else {
        this.quizzesService.createQuizSet(
          currentUser.userId,
          this.quizTitle,
          this.quizDescription || '',
          false,
          quizType,
          quizItems
        ).subscribe({
          next: (response) => {
            this.loadQuizSetsFromBackend();
            this.closeModal();
          },
          error: (error) => {
            this.isLoading = false;
            this.showNotification('Save Failed', 'Unable to save your quiz set. Please try again.', 'error');
          }
        });
      }
    }
  }



  private updateQuizSetAndAddQuizzes(userId: number, quizType: QuizType, quizItems: QuizItem[]) {
    this.quizzesService.updateQuizSet(
      this.editingQuizId!,
      userId,
      this.quizTitle,
      this.quizDescription || '',
      false,
      quizType,
      []
    ).subscribe({
      next: () => {
        const addObservables = quizItems.map(item => 
          this.quizzesService.addQuizToSet(this.editingQuizId!, item)
        );

        if (addObservables.length > 0) {
          import('rxjs').then(rxjs => {
            rxjs.forkJoin(addObservables).subscribe({
              next: () => {
                this.loadQuizSetsFromBackend();
                this.editingQuizId = null;
                this.closeModal();
              },
              error: (error) => {
                this.isLoading = false;
              }
            });
          });
        } else {
          this.loadQuizSetsFromBackend();
          this.editingQuizId = null;
          this.closeModal();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showNotification('Update Failed', 'Unable to update your quiz set. Please try again.', 'error');
      }
    });
  }

  editQuiz(id: number) {
    const quiz = this.quizzes.find(q => q.quiz_id === id);
    if (quiz) {
      this.editingQuizId = id;
      this.quizTitle = quiz.title;
      this.quizDescription = quiz.description || '';
      this.selectedQuestionType = quiz.questionType;
      this.questions = JSON.parse(JSON.stringify(quiz.questions));
      this.currentPage = 0;
      this.isQuestionModalOpen = true;
    }
  }

  deleteQuiz(id: number) {
    this.quizIdToDelete = id;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.quizIdToDelete = null;
  }

  showNotification(title: string, message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.notificationTitle = title;
    this.notificationMessage = message;
    this.notificationType = type;
    this.isNotificationModalOpen = true;
  }

  closeNotificationModal() {
    this.isNotificationModalOpen = false;
  }

  confirmDelete() {
    if (this.quizIdToDelete === null) {
      return;
    }

    this.isLoading = true;
    this.isDeleteModalOpen = false;

    this.quizzesService.deleteQuizSet(this.quizIdToDelete).subscribe({
      next: () => {
        this.loadQuizSetsFromBackend();
        
        const maxPage = Math.max(0, Math.ceil(this.quizzesList.length / this.quizzesPerPage) - 1);
        if (this.quizzesCurrentPage > maxPage) {
          this.quizzesCurrentPage = maxPage;
        }

        this.quizIdToDelete = null;
      },
      error: (error) => {
        this.isLoading = false;
        this.quizIdToDelete = null;
        this.showNotification('Delete Failed', 'Unable to delete your quiz set. Please try again.', 'error');
      }
    });
  }

  playQuiz(id: number) {
    this.router.navigate(['/app/quizzes', id]);
  }
  
  openPrivacyModal(quizId: number) {
    this.selectedQuizIdForPrivacy = quizId;
    this.isPrivacyModalOpen = true;
  }

  closePrivacyModal() {
    this.isPrivacyModalOpen = false;
    this.selectedQuizIdForPrivacy = null;
  }

  selectShareOption() {
    if (this.selectedQuizIdForPrivacy !== null) {
      this.closePrivacyModal();
      this.openShareModal(this.selectedQuizIdForPrivacy);
    }
  }

  selectPrivateOption() {
    if (this.selectedQuizIdForPrivacy !== null) {
      this.togglePrivacy(this.selectedQuizIdForPrivacy);
    }
    this.closePrivacyModal();
  }

  togglePrivacy(id: number) {
    const quiz = this.quizzesList.find(q => q.quiz_id === id);
    if (quiz) {
      quiz.is_public = !quiz.is_public;
      this.quizzesList = [...this.quizzesList];
    }
  }

  openShareModal(quizId?: number) {
    this.isShareModalOpen = true;

    if (quizId) {
      this.selectedQuizId = quizId;

      const quiz = this.quizzes.find(q => q.quiz_id === quizId);
      if (quiz) {
        this.shareTitle = quiz.title;
        this.shareDescription = quiz.description || '';
        this.shareCategory = ''; 
      }
    } else {
      this.selectedQuizId = null;
      this.shareTitle = '';
      this.shareCategory = '';
      this.shareDescription = '';
    }
  }

  closeShareModal() {
    this.isShareModalOpen = false;
    this.selectedQuizId = null;
    this.shareTitle = '';
    this.shareCategory = '';
    this.shareDescription = '';
  }

  saveShare() {
    if (
      this.selectedQuizId &&
      this.shareTitle.trim() &&
      this.shareDescription.trim() &&
      this.shareCategory.trim()
    ) {
      const quiz = this.quizzesList.find(q => q.quiz_id === this.selectedQuizId);

      if (quiz) {
        quiz.is_public = true;
        this.quizzesList = [...this.quizzesList];
      }

      this.closeShareModal();
    }
  }
  
  getQuestionCount(quiz: Quiz): number {
    return quiz.questions.length;
  }

  getQuestionTypeLabel(type: QuestionType): string {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return 'Multiple Choice';
      case QuestionType.IDENTIFICATION:
        return 'Identification';
      default:
        return 'Unknown';
    }
  }

  isMultipleChoice(): boolean {
    return this.selectedQuestionType === QuestionType.MULTIPLE_CHOICE;
  }

  isIdentification(): boolean {
    return this.selectedQuestionType === QuestionType.IDENTIFICATION;
  }
}