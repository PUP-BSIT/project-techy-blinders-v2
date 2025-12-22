import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { QuizzesService, QuizType, QuizItem, QuestionType } from '../../../service/quizzes.service';
import { AuthService } from '../../../service/auth.service';
import { CommunityService } from '../../../service/community.service';

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
  get isShareDisabledForSelectedQuiz(): boolean {
    if (this.selectedQuizIdForPrivacy === null) return false;
    const quiz = this.quizzesList.find(q => q.quiz_id === this.selectedQuizIdForPrivacy);

    return !!quiz?.is_public || (quiz?.questions?.length ?? 0) < 3;
  }

  get isPrivateDisabledForSelectedQuiz(): boolean {
    if (this.selectedQuizIdForPrivacy === null) return false;
    const quiz = this.quizzesList.find(q => q.quiz_id === this.selectedQuizIdForPrivacy);
    // Disable if already private
    return quiz?.is_public === false;
  }

  get canShareSelectedQuiz(): boolean {
    if (this.selectedQuizIdForPrivacy === null) return false;
    const quiz = this.quizzesList.find(q => q.quiz_id === this.selectedQuizIdForPrivacy);
    return (quiz?.questions?.length ?? 0) >= 3;
  }

  isQuizSetCreateSuccessPopupOpen: boolean = false;

  openQuizSetCreateSuccessPopup() {
    this.isQuizSetCreateSuccessPopupOpen = true;
  }

  closeQuizSetCreateSuccessPopup() {
    this.isQuizSetCreateSuccessPopupOpen = false;
  }

  isQuizSetDeleteSuccessPopupOpen: boolean = false;

  openQuizSetDeleteSuccessPopup() {
    this.isQuizSetDeleteSuccessPopupOpen = true;
  }

  closeQuizSetDeleteSuccessPopup() {
    this.isQuizSetDeleteSuccessPopupOpen = false;
  }

  openQuizItemSaveSuccessPopup() {
    this.isQuizItemSaveSuccessPopupOpen = true;
    setTimeout(() => {
      this.isQuizItemSaveSuccessPopupOpen = false;
    }, 5000);
  }

  closeQuizItemSaveSuccessPopup() {
    this.isQuizItemSaveSuccessPopupOpen = false;
  }

  isPrivateSuccessPopupOpen: boolean = false;

  openPrivateSuccessPopup() {
    this.isPrivateSuccessPopupOpen = true;
    setTimeout(() => {
      this.isPrivateSuccessPopupOpen = false;
    }, 5000);
  }

  closePrivateSuccessPopup() {
    this.isPrivateSuccessPopupOpen = false;
  }
  
  isQuizShareSuccessPopupOpen: boolean = false;

  openQuizShareSuccessPopup() {
    this.isQuizShareSuccessPopupOpen = true;
    setTimeout(() => {
      this.isQuizShareSuccessPopupOpen = false;
    }, 5000);
  }

  closeQuizShareSuccessPopup() {
    this.isQuizShareSuccessPopupOpen = false;
  }
  
  isQuizItemSaveSuccessPopupOpen: boolean = false;
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
  private communityService = inject(CommunityService);
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
      this.isQuizSetCreateSuccessPopupOpen = false;
      setTimeout(() => {
        this.openQuizSetCreateSuccessPopup();
      }, 0);
    }
  }

  saveQuizFromQuestionModal() {
    if (this.quizTitle.trim()) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser || !currentUser.userId) {
        this.showNotification('Login Required', 'Please log in to save your quiz sets.', 'warning');
        return;
      }

      let quizType: QuizType = QuizType.MULTIPLE_CHOICE;
      if (this.selectedQuestionType === QuestionType.IDENTIFICATION) {
        quizType = QuizType.IDENTIFICATION_ANSWER;
      }

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

      if (this.questions.length > 0) {
        this.openQuizItemSaveSuccessPopup();
      }

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
            this.openQuizSetCreateSuccessPopup();
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
        this.isQuizSetDeleteSuccessPopupOpen = false;
        setTimeout(() => {
          this.openQuizSetDeleteSuccessPopup();
        }, 0);
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
      const quizId = this.selectedQuizIdForPrivacy;
      this.closePrivacyModal();
      this.openShareModal(quizId);
    }
  }

  selectPrivateOption() {
    if (this.selectedQuizIdForPrivacy !== null) {
      this.makeQuizPrivate(this.selectedQuizIdForPrivacy);
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

  private makeQuizPrivate(quizId: number) {
    const quiz = this.quizzesList.find(q => q.quiz_id === quizId);
    const currentUser = this.authService.getCurrentUser();

    if (!quiz || !currentUser || !currentUser.userId) {
      this.togglePrivacy(quizId);
      return;
    }

    const quizItems: QuizItem[] = quiz.questions.map(q => ({
      quizType: quiz.questionType === QuestionType.MULTIPLE_CHOICE
        ? QuizType.MULTIPLE_CHOICE
        : QuizType.IDENTIFICATION_ANSWER,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      identificationAnswer: q.answer,
      points: 1
    }));

    this.isLoading = true;

    this.quizzesService.updateQuizSet(
      quiz.quiz_id,
      currentUser.userId,
      quiz.title,
      quiz.description || '',
      false,
      quiz.questionType === QuestionType.MULTIPLE_CHOICE
        ? QuizType.MULTIPLE_CHOICE
        : QuizType.IDENTIFICATION_ANSWER,
      quizItems
    ).subscribe({
      next: () => {
        quiz.is_public = false;
        this.quizzesList = [...this.quizzesList];

        this.removeQuizFromCommunity(quiz.quiz_id);

        this.isLoading = false;
        this.openPrivateSuccessPopup();
      },
      error: (error) => {
        console.error('Error making quiz private:', error);
        this.isLoading = false;
        this.showNotification(
          'Update Failed',
          'Unable to update quiz privacy. Please try again.',
          'error'
        );
      }
    });
  }

  private removeQuizFromCommunity(quizId: number) {
    const slugPrefix = `quiz-${quizId}-`;
    const posts = this.communityService.getPosts();

    posts
      .filter(post => post.slug && post.slug.startsWith(slugPrefix))
      .forEach(post => this.communityService.deletePostPermanently(post.post_id));
  }

  openShareModal(quizId?: number) {
    this.isShareModalOpen = true;

    if (quizId) {
      this.selectedQuizId = quizId;

      const quiz = this.quizzes.find(q => q.quiz_id === quizId);
      if (quiz) {
        this.shareTitle = '';
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
      this.shareCategory.trim()
    ) {
      const quiz = this.quizzesList.find(q => q.quiz_id === this.selectedQuizId);
      const currentUser = this.authService.getCurrentUser();

      if (quiz && currentUser) {
        if (quiz.questions.length < 3) {
          this.showNotification(
            'Cannot Share Quiz',
            'You need at least 3 questions in this quiz set before you can share it publicly.',
            'warning'
          );
          return;
        }

        const quizContent = `${quiz.title} • ${quiz.description || 'A quiz set to test your knowledge!'} • ${this.getQuestionTypeLabel(quiz.questionType)}`;

        const quizSlug = `quiz-${quiz.quiz_id}-${this.slugify(this.shareTitle)}`;
        
        this.communityService.createPost({
          user_id: String(currentUser.userId),
          username: currentUser.username,
          title: this.shareTitle,
          content: quizContent,
          slug: quizSlug,
          category: this.shareCategory,
          is_published: true,
          commentcount: 0,
          showcomment: true,
          likes: 0,
          dislikes: 0
        });

        const quizItems: QuizItem[] = quiz.questions.map(q => ({
          quizType: quiz.questionType === QuestionType.MULTIPLE_CHOICE 
            ? QuizType.MULTIPLE_CHOICE 
            : QuizType.IDENTIFICATION_ANSWER,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          identificationAnswer: q.answer,
          points: 1
        }));

        this.quizzesService.updateQuizSet(
          quiz.quiz_id,
          currentUser.userId,
          quiz.title,
          quiz.description || '',
          true,
          quiz.questionType === QuestionType.MULTIPLE_CHOICE 
            ? QuizType.MULTIPLE_CHOICE 
            : QuizType.IDENTIFICATION_ANSWER,
          quizItems
        ).subscribe({
          next: () => {
            quiz.is_public = true;
            this.quizzesList = [...this.quizzesList];
            
            this.closeShareModal();
            this.openQuizShareSuccessPopup();
          },
          error: (error) => {
            console.error('Error updating quiz visibility:', error);
            this.showNotification(
              'Warning',
              'Quiz was shared but visibility update failed.',
              'warning'
            );
          }
        });
      }

      this.closeShareModal();
    } else {
      let errorMessage = 'Please ';
      const missing = [];
      
      if (!this.selectedQuizId) missing.push('select a quiz');
      if (!this.shareTitle.trim()) missing.push('enter a caption');
      if (!this.shareCategory.trim()) missing.push('select a category');
      
      errorMessage += missing.join(', ') + ' before sharing.';
      
      this.showNotification(
        'Warning',
        errorMessage,
        'warning'
      );
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

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }
}