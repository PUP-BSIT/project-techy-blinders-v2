import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { StudySet, StudySetsService } from '../../../service/study-sets.service';
import { CommunityService } from '../../../service/community.service';
import { QuestionSuggestionService } from '../../../service/question-suggestion.service';
import { response } from 'express';
import { error } from 'console';

@Component({
  selector: 'app-study-sets-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './study-sets-page.html',
  styleUrls: ['./study-sets-page.scss']
})
export class StudySetsPage implements OnInit, OnDestroy {
  isStudySetDeleteSuccessPopupOpen: boolean = false;
  isModalOpen: boolean = false;
  isFlashcardModalOpen: boolean = false;
  isConfirmModalOpen: boolean = false;
  isPrivateSuccessPopupOpen: boolean = false;
  isWarningPopupOpen: boolean = false;
  isFlashcardSaveSuccessPopupOpen: boolean = false;
  warningMessage: string = '';
  studySetTitle: string = '';
  studySetDescription: string = '';
  flashcards: {
    flashcardId?: number;
    term: string;
    definition: string;
    isNew?: boolean;
  }[] = [];
  deletedFlashcardIds: number[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 3;
  studySetsCurrentPage: number = 0;
  studySetsPerPage: number = 3;
  editingStudySetId: number | null = null;
  currentStudySetId: number | null = null;
  activeDropdown: number | null = null;
  isPrivacyModalOpen: boolean = false;
  isShareModalOpen: boolean = false;
  selectedStudySetId: number | null = null;
  shareTitle: string = '';
  shareCategory: string = '';
  shareDescription: string = '';
  isLoading: boolean = false;
  isSuccessPopupOpen: boolean = false;
  studySets: StudySet[] = [];
  suggestedQuestions: string[] = [];
  isLoadingSuggestion: boolean = false;
  isShowSuggestion: boolean = false;
  isAiSuggestionsModalOpen: boolean = false;
  
  private studySetsService = inject(StudySetsService);
  private authService = inject(AuthService);
  private communityService = inject(CommunityService);
  private questionSuggestionService = inject (QuestionSuggestionService)

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadStudySets();
    this.route.queryParams.subscribe(params => {
      if (params['create'] === 'true') {
        this.openModal();
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          queryParamsHandling: 'merge'
        });
      }
    });

    window.addEventListener('storage', this.onStorageEvent);
  }

  generateAiSuggestions() {
    if (!this.studySetTitle.trim()) {
      this.openWarningPopup('Please enter a title first');
      return;
    }
    this.isAiSuggestionsModalOpen = true;
    this.isLoadingSuggestion = true;
    this.isShowSuggestion = false;

    this.questionSuggestionService.generateSuggestion (
      this.studySetTitle,
      this.studySetDescription || 'A Study set that will help you learn'
    ).subscribe ({
      next:(response) => {
        this.suggestedQuestions = response.questions;
        this.isShowSuggestion = true;
        this.isLoadingSuggestion = false;
      },

      error:(error) => {
        console.error('Error generating suggestions', error);
        this.isLoadingSuggestion = false;
        this.openWarningPopup('Failed to load a suggestions.')
      }
    });
  }
  
  closeSuggestions() {
    this.isAiSuggestionsModalOpen = false;
    this.isShowSuggestion = false;
    this.suggestedQuestions = [];
  }
  
  private onStorageEvent = (e: StorageEvent) => {
    if (!e) return;
    if (e.key === 'studySetsUpdated') {
      this.loadStudySets();
    }
  }

  private loadStudySets(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    this.isLoading = true;
    this.studySetsService.getStudySetsByUserId(currentUser.userId).subscribe({
      next: (studySets) => {
        this.studySets = (studySets || []).slice().sort((a, b) => {
          const aDate = new Date(a.created_at).getTime();
          const bDate = new Date(b.created_at).getTime();
          return bDate - aDate;
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading study sets:', error);
        console.error('Error details:', {
          status: error?.status,
          statusText: error?.statusText,
          message: error?.message,
          error: error?.error
        });
        this.isLoading = false;
      }
    });
  }

  get paginatedStudySets(): StudySet[] {
    const startIndex = this.studySetsCurrentPage * this.studySetsPerPage;
    return this.studySets.slice(startIndex, startIndex + this.studySetsPerPage);
  }

  get studySetsTotalPages(): number {
    return Math.ceil(this.studySets.length / this.studySetsPerPage);
  }

  get studySetsPages(): (number | string)[] {
    const totalPages = this.studySetsTotalPages;
    const currentPage = this.studySetsCurrentPage;
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

  goToStudySetsPage(page: number) {
    this.studySetsCurrentPage = page;
  }

  isPageNumber(page: number | string): boolean {
    return typeof page === 'number';
  }

  getPageNumber(page: number | string): number {
    return page as number;
  }

  getPageDisplay(page: number | string): string {
    return typeof page === 'number'
      ? String((page as number) + 1)
      : (page as string);
  }

  nextStudySetsPage() {
    if (this.studySetsCurrentPage < this.studySetsTotalPages - 1) {
      this.studySetsCurrentPage++;
    }
  }

  previousStudySetsPage() {
    if (this.studySetsCurrentPage > 0) {
      this.studySetsCurrentPage--;
    }
  }

  openModal() {
    this.isModalOpen = true;
    this.studySetTitle = '';
    this.studySetDescription = '';
    this.editingStudySetId = null;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isConfirmModalOpen = false;
    this.editingStudySetId = null;
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
  }


  pendingDeleteStudySetId: number | null = null;

  openDeleteConfirm(id: number) {
    this.pendingDeleteStudySetId = id;
    this.openConfirmModal();
  }

  confirmDelete() {
    if (this.pendingDeleteStudySetId !== null) {
      const id = this.pendingDeleteStudySetId;
      this.pendingDeleteStudySetId = null;
      this.closeConfirmModal();
      this.deleteStudySet(id);
      this.isStudySetDeleteSuccessPopupOpen = false;
      setTimeout(() => {
        this.openStudySetDeleteSuccessPopup();
      }, 10);
    }
  }

  cancelDelete() {
    this.pendingDeleteStudySetId = null;
    this.closeConfirmModal();
  }

  saveStudySet() {
    if (this.studySetTitle.trim()) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      this.isLoading = true;
      this.studySetsService.createStudySet(
        currentUser.userId,
        this.studySetTitle,
        this.studySetDescription,
        false,
        []
      ).subscribe({
        next: (newStudySet) => {
          this.currentStudySetId = newStudySet.flashcard_id;
          this.flashcards = [];
          this.currentPage = 0;
          this.isLoading = false;
          this.closeModal();
          this.openFlashcardModal();


          this.studySets.unshift(newStudySet);
          this.studySets.sort((a, b) => {
            const aDate = new Date(a.created_at).getTime();
            const bDate = new Date(b.created_at).getTime();
            return bDate - aDate;
          });

          try {
            localStorage.setItem(
              'studySetsUpdated',
              Date.now().toString()
            );
          } catch (e) {}
          this.isStudySetCreateSuccessPopupOpen = false;
          setTimeout(() => {
            this.openStudySetCreateSuccessPopup();
          }, 10);
        },
        error: (error) => {
          console.error('Error creating study set:', error);
          console.error('Error details:', {
            status: error?.status,
            statusText: error?.statusText,
            message: error?.message,
            error: error?.error
          });
          this.isLoading = false;
        }
      });
    }
  }

  openFlashcardModal() {
    this.isFlashcardModalOpen = true;
  }

  closeFlashcardModal() {
    this.isFlashcardModalOpen = false;
    this.flashcards = [];
    this.currentPage = 0;
    this.currentStudySetId = null;
    this.deletedFlashcardIds = [];
  }

  saveFlashcards() {
    this.isFlashcardSaveSuccessPopupOpen = false;

    const hasEmpty = this.flashcards.some(
      f => !f.term.trim() || !f.definition.trim()
    );
    if (hasEmpty) {
      this.openWarningPopup(
        'Please fill in both the term and definition for all flashcards.'
      );
      return;
    }

    if (this.currentStudySetId !== null) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        return;
      }

      let studySet = this.studySets.find(
        s => s.flashcard_id === this.currentStudySetId
      );

      if (!studySet) {
        this.isLoading = true;
        this.studySetsService.getStudySetById(this.currentStudySetId).subscribe({
          next: (fetchedSet) => {
            this.proceedWithSave(fetchedSet, currentUser.userId);
          },
          error: (error) => {
            console.error('Error fetching study set:', error);
            this.isLoading = false;
          }
        });
      } else {
        this.proceedWithSave(studySet, currentUser.userId);
      }
    } else {
      this.closeFlashcardModal();
    }
  }

  private proceedWithSave(studySet: StudySet, userId: number) {
    if (!studySet || this.currentStudySetId === null) {
      console.error('Study set not found');
      this.closeFlashcardModal();
      return;
    }

    this.isLoading = true;

    const prepared = this.flashcards
      .map(f => ({
        keyTerm: f.term.trim(),
        definition: f.definition.trim(),
        flashcardId: f.flashcardId,
        isNew: f.isNew
      }))
      .filter(f => f.keyTerm && f.definition);


    if (prepared.length === 0 && this.deletedFlashcardIds.length === 0) {
      this.isLoading = false;
      this.closeFlashcardModal();
      return;
    }

    const studySetIdToRefresh = this.currentStudySetId as number;

    const toCreate = prepared.filter(f => !f.flashcardId);
    const toUpdate = prepared.filter(f => !!f.flashcardId);

    const updateObs = toUpdate.map(f =>
      this.studySetsService.updateFlashcard(
        f.flashcardId as number,
        f.keyTerm,
        f.definition
      )
    );
    const deleteObs = this.deletedFlashcardIds.length > 0
      ? this.deletedFlashcardIds.map(id =>
          this.studySetsService.deleteFlashcard(id)
        )
      : [];

    const updateDeleteObs = [...updateObs, ...deleteObs];
    const updateDeleteBatch$ = 
            updateDeleteObs.length ? forkJoin(updateDeleteObs) : of([]);

    updateDeleteBatch$.subscribe({
      next: () => {
        const addFlashcardsSequentially = (index: number = 0): void => {
          if (index >= toCreate.length) {
            this.isLoading = false;
            if (prepared.length > 0 || this.deletedFlashcardIds.length > 0) {
              this.openFlashcardSaveSuccessPopup();
            }
            this.deletedFlashcardIds = [];
            this.closeFlashcardModal();
            this.refreshStudySetFromBackend(studySetIdToRefresh, []);
            return;
          }

          const f = toCreate[index];
          this.studySetsService.addFlashcardToSet(
            studySetIdToRefresh,
            f.keyTerm,
            f.definition
          ).subscribe({
            next: () => {
              setTimeout(() => addFlashcardsSequentially(index + 1), 10);
            },
            error: (error) => {
              console.error('Error adding flashcard:', error);
              this.isLoading = false;
              this.deletedFlashcardIds = [];
            }
          });
        };

        if (toCreate.length > 0) {
          addFlashcardsSequentially();
        } else {
          this.isLoading = false;
          if (prepared.length > 0 || this.deletedFlashcardIds.length > 0) {
            this.openFlashcardSaveSuccessPopup();
          }
          this.deletedFlashcardIds = [];
          this.closeFlashcardModal();
          this.refreshStudySetFromBackend(studySetIdToRefresh, []);
        }
      },
      error: (error) => {
        console.error('Error saving/updating/deleting flashcards:', error);
        this.isLoading = false;
        this.deletedFlashcardIds = [];
      }
    });
  }

  addFlashcard() {
    const newFlashcard = {
      term: '',
      definition: '',
      isNew: true
    };
    this.flashcards.push(newFlashcard);

    this.currentPage = Math.floor(
      (this.flashcards.length - 1) / this.itemsPerPage
    );
  }

  editFlashcard(index: number) {
    const flashcard = this.flashcards[index];
    if (flashcard && flashcard.flashcardId) {
      flashcard.isNew = false;
    }
  }

  deleteFlashcard(index: number) {
    const flashcardToDelete = this.flashcards[index];
    
    if (flashcardToDelete.flashcardId) {
      this.deletedFlashcardIds.push(flashcardToDelete.flashcardId);
    }
    
    this.flashcards.splice(index, 1);
    const maxPage = Math.max(
      0,
      Math.ceil(this.flashcards.length / this.itemsPerPage) - 1
    );
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
  }

  ngOnDestroy() {
    try {
      window.removeEventListener(
        'storage',
        this.onStorageEvent
      );
    } catch (e) {}
  }

  get paginatedFlashcards() {
    const startIndex = this.currentPage * this.itemsPerPage;
    return this.flashcards.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.flashcards.length / this.itemsPerPage);
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

  editStudySet(id: number) {
    this.isLoading = true;
    this.isFlashcardSaveSuccessPopupOpen = false;
    this.studySetsService.getStudySetById(id).subscribe({
      next: (studySet) => {
        this.currentStudySetId = id;
        
        const sorted = [...studySet.flashcards].sort((a, b) => {
          const aId = a.flashcardId || 0;
          const bId = b.flashcardId || 0;
          return aId - bId;
        });

        this.flashcards = sorted.map(f => ({
          flashcardId: f.flashcardId,
          term: f.keyTerm,
          definition: f.definition || '',
          isNew: false
        }));
        
        this.currentPage = 0;
        this.isLoading = false;
        this.openFlashcardModal();
      },
      error: (error) => {
        console.error('Error loading study set:', error);
        this.isLoading = false;
      }
    });
    this.closeDropdown();
  }

  private refreshStudySetFromBackend(id: number, createdIds: number[] = []) {
    this.studySetsService.getStudySetById(id).subscribe({
      next: (freshStudySet) => {
        const index = this.studySets.findIndex(
          s => s.flashcard_id === freshStudySet.flashcard_id
        );
        if (index !== -1) {
          this.studySets[index] = freshStudySet;
        }

        if (this.currentStudySetId === id) {
          const sorted = [...freshStudySet.flashcards].sort((a, b) => {
            const aId = a.flashcardId || 0;
            const bId = b.flashcardId || 0;
            return aId - bId;
          });
          
          this.flashcards = sorted.map(f => ({
            flashcardId: f.flashcardId,
            term: f.keyTerm,
            definition: f.definition || '',
            isNew: false
          }));
        }
      },
      error: (error) => {
        console.error('Error refreshing study set:', error);
      }
    });
  }

  deleteStudySet(id: number) {
    this.isLoading = true;
    this.studySetsService.deleteStudySet(id).subscribe({
      next: () => {
        this.studySets = this.studySets.filter(s => s.flashcard_id !== id);
        const maxPage = Math.max(
          0,
          Math.ceil(this.studySets.length / this.studySetsPerPage) - 1
        );
        if (this.studySetsCurrentPage > maxPage) {
          this.studySetsCurrentPage = maxPage;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting study set:', error);
        this.isLoading = false;
      }
    });
    this.closeDropdown();
  }

  playStudySet(id: number) {
    this.router.navigate(['/app/study-sets', id]);
    this.closeDropdown();
  }

  toggleDropdown(index: number) {
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  togglePrivacy(id: number) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    const studySet = this.studySets.find(s => s.flashcard_id === id);
    if (!studySet) {
      console.error('Study set not found');
      return;
    }

    this.isLoading = true;
    const newPrivacyStatus = !studySet.is_public;
    
    this.studySetsService.updateStudySet(
      id,
      currentUser.userId,
      studySet.title,
      studySet.description,
      newPrivacyStatus,
      studySet.flashcards
    ).subscribe({
      next: (updatedStudySet) => {
        const index = this.studySets.findIndex(s => s.flashcard_id === updatedStudySet.flashcard_id);
        if (index !== -1) {
          this.studySets[index] = updatedStudySet;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating privacy:', error);
        this.isLoading = false;
      }
    });
    this.activeDropdown = null;
  }

  openPrivacyModal(studySetId: number) {
    this.selectedStudySetId = studySetId;
    this.isPrivacyModalOpen = true;
  }

  closePrivacyModal() {
    this.isPrivacyModalOpen = false;
    this.selectedStudySetId = null;
  }

  selectShareOption() {
    if (this.selectedStudySetId !== null) {

      const studySet = this.studySets.find(s => s.flashcard_id === this.selectedStudySetId);
      if (studySet && studySet.flashcards.length < 3) {
        this.openWarningPopup('You need at least 3 flashcards in this set before you can share it publicly.');
        this.closePrivacyModal();
        return;
      }

      const studySetId = this.selectedStudySetId;
      this.closePrivacyModal();
      this.openShareModal(studySetId);
    }
  }

  selectPrivateOption() {
    if (this.selectedStudySetId !== null) {
      this.makeStudySetPrivate(this.selectedStudySetId);
    }
    this.closePrivacyModal();
  }

  openPrivateSuccessPopup() {
    this.isPrivateSuccessPopupOpen = true;
  }

  closePrivateSuccessPopup() {
    this.isPrivateSuccessPopupOpen = true;
  }

  openWarningPopup(message: string) {
    this.isWarningPopupOpen = false;
    this.warningMessage = '';
    setTimeout(() => {
      this.warningMessage = message;
      this.isWarningPopupOpen = true;
    }, 0);
  }

  closeWarningPopup() {
    this.isWarningPopupOpen = false;
    this.warningMessage = '';
  }

  openFlashcardSaveSuccessPopup() {
    this.isFlashcardSaveSuccessPopupOpen = true;
  }

  closeFlashcardSaveSuccessPopup() {
    this.isFlashcardSaveSuccessPopupOpen = false;
  }

  openShareModal(studySetId?: number) {
    this.isShareModalOpen = true;
    if (studySetId) {
      this.selectedStudySetId = studySetId;
      const studySet = this.studySets.find(s => s.flashcard_id === studySetId);
      if (studySet) {
        this.shareTitle = '';
        this.shareDescription = studySet.description || '';
      }
    } else {
      this.selectedStudySetId = null;
      this.shareTitle = '';
      this.shareCategory = '';
      this.shareDescription = '';
    }
    this.closeDropdown();
  }

  closeShareModal() {
    this.isShareModalOpen = false;
    this.selectedStudySetId = null;
    this.shareTitle = '';
    this.shareCategory = '';
    this.shareDescription = '';
  }

  openSuccessPopup() {
    this.isSuccessPopupOpen = true;
  }

  saveShare() {
    if (this.selectedStudySetId && this.shareTitle.trim() && this.shareCategory.trim()) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      const studySet = this.studySets.find(s => s.flashcard_id === this.selectedStudySetId);
      if (!studySet) {
        console.error('Study set not found');
        return;
      }


      if (studySet.flashcards.length < 3) {
        this.isWarningPopupOpen = false;
        setTimeout(() => {
          this.openWarningPopup('You need at least 3 flashcards in this set before you can share it publicly.');
        }, 0);
        return;
      }

      const flashcardContent = `${studySet.title} • ${studySet.description || 'A flashcard set to help you study!'} • Flashcards`;

      const flashcardSlug = `flashcard-${studySet.flashcard_id}-${this.slugify(this.shareTitle)}`;
      
      this.communityService.createPost({
        user_id: String(currentUser.userId),
        username: currentUser.username,
        title: this.shareTitle,
        content: flashcardContent,
        slug: flashcardSlug,
        category: this.shareCategory,
        is_published: true,
        commentcount: 0,
        showcomment: true,
        likes: 0,
        dislikes: 0
      });

      this.isLoading = true;
      this.studySetsService.updateStudySet(
        this.selectedStudySetId,
        currentUser.userId,
        studySet.title,
        studySet.description || '',
        true,
        studySet.flashcards
      ).subscribe({
        next: (updatedStudySet) => {
          const index = this.studySets.findIndex(s => s.flashcard_id === updatedStudySet.flashcard_id);
          if (index !== -1) {
            this.studySets[index] = updatedStudySet;
          }
          this.isLoading = false;
          this.closeShareModal();
          this.isSuccessPopupOpen = false;
          setTimeout(() => {
            this.openSuccessPopup();
          }, 10);
        },
        error: (error) => {
          console.error('Error updating flashcard visibility:', error);
          this.isLoading = false;
          this.closeShareModal();
        }
      });
    } else {
      let errorMessage = 'Please ';
      const missing = [];
      
      if (!this.selectedStudySetId) missing.push('select a flashcard set');
      if (!this.shareTitle.trim()) missing.push('enter a caption');
      if (!this.shareCategory.trim()) missing.push('select a category');
      
      errorMessage += missing.join(', ') + ' before sharing.';
      this.openWarningPopup(errorMessage);
    }
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

  private makeStudySetPrivate(studySetId: number) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      this.togglePrivacy(studySetId);
      return;
    }

    const studySet = this.studySets.find(s => s.flashcard_id === studySetId);
    if (!studySet) {
      console.error('Study set not found');
      return;
    }

    this.isLoading = true;

    this.studySetsService.updateStudySet(
      studySetId,
      currentUser.userId,
      studySet.title,
      studySet.description,
      false,
      studySet.flashcards
    ).subscribe({
      next: (updatedStudySet) => {
        const index = this.studySets.findIndex(
          s => s.flashcard_id === updatedStudySet.flashcard_id
        );
        if (index !== -1) {
          this.studySets[index] = updatedStudySet;
        }

        this.removeStudySetFromCommunity(studySetId);

        this.isLoading = false;
        this.isPrivateSuccessPopupOpen = false;
        setTimeout(() => {
          this.openPrivateSuccessPopup();
        }, 10);
      },
      error: (error) => {
        console.error('Error making study set private:', error);
        this.isLoading = false;
      }
    });
  }

  private removeStudySetFromCommunity(studySetId: number) {
    const slugPrefix = `flashcard-${studySetId}-`;
    const posts = this.communityService.getPosts();

    posts
      .filter(
        post => post.slug && post.slug.startsWith(slugPrefix)
      )
      .forEach(
        post =>
          this.communityService.deletePostPermanently(post.post_id)
      );
  }

  enforceTitleLimit() {
    if (this.studySetTitle && this.studySetTitle.length > 50) {
      this.studySetTitle = this.studySetTitle.substring(0, 50);
      this.openWarningPopup('Title can only take up to 50 characters.');
    }
  }

  enforceDescriptionLimit() {
    if (this.studySetDescription && this.studySetDescription.length > 50) {
      this.studySetDescription = this.studySetDescription.substring(0, 50);
      this.openWarningPopup('Description can only take up to 50 characters.');
    }
  }

  enforceFlashcardTermLimit(index: number) {
    const flashcard = this.flashcards[index];
    if (flashcard && flashcard.term && flashcard.term.length > 150) {
      flashcard.term = flashcard.term.substring(0, 150);
      this.openWarningPopup('Key Term can only take up to 150 characters.');
    }
  }

  enforceFlashcardDefinitionLimit(index: number) {
    const flashcard = this.flashcards[index];
    if (flashcard && flashcard.definition && flashcard.definition.length > 150) {
      flashcard.definition = flashcard.definition.substring(0, 150);
      this.openWarningPopup('Description can only take up to 150 characters.');
    }
  }

  get isShareDisabledForSelectedSet(): boolean {
    if (this.selectedStudySetId == null) return false;
    const set = this.studySets?.find(
      (s: any) => s.flashcard_id === this.selectedStudySetId
    );

    return !!set?.is_public || (set?.flashcards?.length ?? 0) < 3;
  }

  get isPrivateDisabledForSelectedSet(): boolean {
    if (this.selectedStudySetId == null) return false;
    const set = this.studySets?.find(
      (s: any) => s.flashcard_id === this.selectedStudySetId
    );

    return set?.is_public === false;
  }

  get canShareSelectedSet(): boolean {
    if (this.selectedStudySetId == null) return false;
    const set = this.studySets?.find(
      (s: any) => s.flashcard_id === this.selectedStudySetId
    );
    return (set?.flashcards?.length ?? 0) >= 3;
  }

  openStudySetDeleteSuccessPopup() {
    this.isStudySetDeleteSuccessPopupOpen = true;
  }

  closeStudySetDeleteSuccessPopup() {
    this.isStudySetDeleteSuccessPopupOpen = false;
  }

  isStudySetCreateSuccessPopupOpen: boolean = false;

  openStudySetCreateSuccessPopup() {
    this.isStudySetCreateSuccessPopupOpen = true;
  }

  closeStudySetCreateSuccessPopup() {
    this.isStudySetCreateSuccessPopupOpen = false;
  }
}