import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StudySetsService, StudySet } from '../../services/study-sets.service';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-study-sets-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './study-sets-page.html',
  styleUrls: ['./study-sets-page.scss']
})
export class StudySetsPage implements OnInit {
  isModalOpen: boolean = false;
  isFlashcardModalOpen: boolean = false;
  isConfirmModalOpen: boolean = false;
  studySetTitle: string = '';
  studySetDescription: string = '';
  flashcards: { term: string; definition: string }[] = [];
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
  studySets: StudySet[] = [];

  private studySetsService = inject(StudySetsService);
  private authService = inject(AuthService);

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
        this.studySets = studySets;
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
        // Optionally show user-friendly error message
        alert('Failed to load study sets. Please check the console for details.');
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
    return typeof page === 'number' ? String((page as number) + 1) : page as string;
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
          alert('Failed to create study set. Please check the console for details.');
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
  }

  saveFlashcards() {
    if (this.currentStudySetId !== null) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      const studySet = this.studySets.find(s => s.flashcard_id === this.currentStudySetId);
      if (!studySet) {
        console.error('Study set not found');
        this.closeFlashcardModal();
        return;
      }

      this.isLoading = true;
      const flashcards = this.flashcards.map(f => ({ 
        keyTerm: f.term, 
        definition: f.definition 
      }));

      this.studySetsService.updateStudySet(
        this.currentStudySetId,
        currentUser.userId,
        studySet.title,
        studySet.description,
        studySet.is_public,
        flashcards
      ).subscribe({
        next: (updatedStudySet) => {
          const index = this.studySets.findIndex(s => s.flashcard_id === updatedStudySet.flashcard_id);
          if (index !== -1) {
            this.studySets[index] = updatedStudySet;
          } else {
            this.studySets.push(updatedStudySet);
          }
          this.isLoading = false;
          this.closeFlashcardModal();
        },
        error: (error) => {
          console.error('Error saving flashcards:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.closeFlashcardModal();
    }
  }

  addFlashcard() {
    this.flashcards.push({ term: '', definition: '' });
    this.currentPage = Math.floor((this.flashcards.length - 1) / this.itemsPerPage);
  }

  editFlashcard(index: number) {
    console.log('Edit flashcard:', index);
  }

  deleteFlashcard(index: number) {
    this.flashcards.splice(index, 1);
    const maxPage = Math.max(0, Math.ceil(this.flashcards.length / this.itemsPerPage) - 1);
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
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
    this.studySetsService.getStudySetById(id).subscribe({
      next: (studySet) => {
        this.currentStudySetId = id;
        this.flashcards = studySet.flashcards.map(f => ({
          term: f.keyTerm,
          definition: f.definition
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

  deleteStudySet(id: number) {
    this.isLoading = true;
    this.studySetsService.deleteStudySet(id).subscribe({
      next: () => {
        this.studySets = this.studySets.filter(s => s.flashcard_id !== id);
        const maxPage = Math.max(0, Math.ceil(this.studySets.length / this.studySetsPerPage) - 1);
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
    this.closeDropdown(); // Close any open dropdown
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
      this.closePrivacyModal();
      this.openShareModal(this.selectedStudySetId);
    }
  }

  selectPrivateOption() {
    if (this.selectedStudySetId !== null) {
      this.togglePrivacy(this.selectedStudySetId);
      this.closePrivacyModal();
    }
  }

  openShareModal(studySetId?: number) {
    this.isShareModalOpen = true;
    if (studySetId) {
      this.selectedStudySetId = studySetId;
      const studySet = this.studySets.find(s => s.flashcard_id === studySetId);
      if (studySet) {
        this.shareTitle = studySet.title;
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

  saveShare() {
    if (this.selectedStudySetId && this.shareTitle && this.shareCategory && this.shareDescription) {
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

      this.isLoading = true;
      // Update the study set to be public and update title/description if changed
      this.studySetsService.updateStudySet(
        this.selectedStudySetId,
        currentUser.userId,
        this.shareTitle,
        this.shareDescription,
        true, // Set to public
        studySet.flashcards
      ).subscribe({
        next: (updatedStudySet) => {
          const index = this.studySets.findIndex(s => s.flashcard_id === updatedStudySet.flashcard_id);
          if (index !== -1) {
            this.studySets[index] = updatedStudySet;
          }
          this.isLoading = false;
          
          console.log('Sharing study set:', {
            id: this.selectedStudySetId,
            title: this.shareTitle,
            category: this.shareCategory,
            description: this.shareDescription
          });
          this.closeShareModal();
        },
        error: (error) => {
          console.error('Error sharing study set:', error);
          this.isLoading = false;
        }
      });
    }
  }
}