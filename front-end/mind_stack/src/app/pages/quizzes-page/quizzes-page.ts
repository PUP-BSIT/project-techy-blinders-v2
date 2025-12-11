import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  IDENTIFICATION = 'identification'
}

export interface QuestionItem {
  question: string;
  // For multiple choice
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  // For identification
  answer?: string;
  // For explanation
  explanation?: string;
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
  
  quizTitle: string = '';
  quizDescription: string = '';
  selectedQuestionType: QuestionType | '' = '';
  questions: QuestionItem[] = [];
  
  currentPage: number = 0;
  
  quizzesCurrentPage: number = 0;
  quizzesPerPage: number = 3;
  
  editingQuizId: number | null = null;
  selectedQuizIdForPrivacy: number | null = null;

  QuestionType = QuestionType;

  isShareModalOpen: boolean = false;
  selectedQuizId: number | null = null;
  shareTitle: string = '';
  shareDescription: string = '';
  shareCategory: string = '';

  private readonly STORAGE_KEY = 'quizzes';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeStorage();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['create'] === 'true') {
        this.openModal();
      }
    });
  }
  
  private initializeStorage(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  private getQuizzesFromStorage(): Quiz[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    
    const quizzes = JSON.parse(data);
    return quizzes.map((quiz: any) => ({
      ...quiz,
      created_at: new Date(quiz.created_at)
    }));
  }

  private saveQuizzesToStorage(quizzes: Quiz[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quizzes));
  }

  // quiz
  
  get quizzes(): Quiz[] {
    return this.getQuizzesFromStorage();
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

  // modals
  
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

  // questions
  
  addQuestion() {
    const newQuestion: QuestionItem = {
      question: ''
    };

    // Initialize based on question type
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

  // pagination
  
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

  // save quizx
  
  saveQuiz() {
    if (this.quizTitle.trim() && this.selectedQuestionType !== '') {
      // Create the quiz immediately
      const allQuizzes = this.getQuizzesFromStorage();
      const newQuizId = Date.now();
      
      const newQuiz: Quiz = {
        quiz_id: newQuizId,
        title: this.quizTitle,
        description: this.quizDescription,
        questions: [],
        questionType: this.selectedQuestionType as QuestionType,
        created_at: new Date(),
        is_public: false
      };
      
      allQuizzes.push(newQuiz);
      this.saveQuizzesToStorage(allQuizzes);
      
      // Set editing mode to this new quiz
      this.editingQuizId = newQuizId;
      
      // Close the initial modal and open the question editor
      this.isModalOpen = false;
      this.isQuestionModalOpen = true;
    }
  }

  saveQuizFromQuestionModal() {
    if (this.quizTitle.trim()) {
      const allQuizzes = this.getQuizzesFromStorage();
      
      if (this.editingQuizId !== null) {
        // update quiz with questions
        const index = allQuizzes.findIndex(q => q.quiz_id === this.editingQuizId);
        if (index !== -1) {
          allQuizzes[index] = {
            quiz_id: this.editingQuizId,
            title: this.quizTitle,
            description: this.quizDescription,
            questions: this.questions,
            questionType: this.selectedQuestionType as QuestionType,
            created_at: allQuizzes[index].created_at,
            is_public: allQuizzes[index].is_public
          };
          
          this.saveQuizzesToStorage(allQuizzes);
        }
      }
      
      this.closeModal();
    }
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
    const allQuizzes = this.getQuizzesFromStorage();
    const filteredQuizzes = allQuizzes.filter(q => q.quiz_id !== id);
    this.saveQuizzesToStorage(filteredQuizzes);
    
    const maxPage = Math.max(0, Math.ceil(filteredQuizzes.length / this.quizzesPerPage) - 1);
    if (this.quizzesCurrentPage > maxPage) {
      this.quizzesCurrentPage = maxPage;
    }
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
    const allQuizzes = this.getQuizzesFromStorage();
    const quiz = allQuizzes.find(q => q.quiz_id === id);
    if (quiz) {
      quiz.is_public = !quiz.is_public;
      this.saveQuizzesToStorage(allQuizzes);
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
      const allQuizzes = this.getQuizzesFromStorage();
      const quiz = allQuizzes.find(q => q.quiz_id === this.selectedQuizId);

      if (quiz) {
        quiz.is_public = true;
        this.saveQuizzesToStorage(allQuizzes);

        console.log('Sharing quiz:', {
          id: this.selectedQuizId,
          title: this.shareTitle,
          category: this.shareCategory,
          description: this.shareDescription
        });
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