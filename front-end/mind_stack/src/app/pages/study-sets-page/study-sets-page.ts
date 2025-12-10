import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

export interface StudySet {
  flashcard_id: number;
  title: string;
  description: string;
  flashcards: { keyTerm: string; definition: string }[];
  created_at: Date;
  is_public: boolean;
}

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

  private readonly STORAGE_KEY = 'studySets';

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
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          queryParamsHandling: 'merge'
        });
      }
    });
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  private getStudySetsFromStorage(): StudySet[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    
    const studySets = JSON.parse(data);
    return studySets.map((studySet: any) => ({
      ...studySet,
      created_at: new Date(studySet.created_at)
    }));
  }

  private saveStudySetsToStorage(studySets: StudySet[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(studySets));
  }

  get studySets(): StudySet[] {
    return this.getStudySetsFromStorage();
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
      const allStudySets = this.getStudySetsFromStorage();
      
      const newStudySet: StudySet = {
        flashcard_id: Date.now(),
        title: this.studySetTitle,
        description: this.studySetDescription,
        flashcards: [],
        created_at: new Date(),
        is_public: false
      };
      allStudySets.push(newStudySet);
      this.saveStudySetsToStorage(allStudySets);
      
      this.currentStudySetId = newStudySet.flashcard_id;
      this.flashcards = [];
      this.currentPage = 0;
      this.closeModal();
      this.openFlashcardModal();
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
      const allStudySets = this.getStudySetsFromStorage();
      const studySet = allStudySets.find(s => s.flashcard_id === this.currentStudySetId);
      
      if (studySet) {
        studySet.flashcards = this.flashcards.map(f => ({ 
          keyTerm: f.term, 
          definition: f.definition 
        }));
        this.saveStudySetsToStorage(allStudySets);
      }
    }
    this.closeFlashcardModal();
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
    const studySet = this.studySets.find(s => s.flashcard_id === id);
    if (studySet) {
      this.currentStudySetId = id;
      this.flashcards = studySet.flashcards.map(f => ({
        term: f.keyTerm,
        definition: f.definition
      }));
      this.currentPage = 0;
      this.openFlashcardModal();
    }
    this.closeDropdown();
  }

  deleteStudySet(id: number) {
    const allStudySets = this.getStudySetsFromStorage();
    const filteredStudySets = allStudySets.filter(s => s.flashcard_id !== id);
    this.saveStudySetsToStorage(filteredStudySets);
    
    const maxPage = Math.max(0, Math.ceil(filteredStudySets.length / this.studySetsPerPage) - 1);
    if (this.studySetsCurrentPage > maxPage) {
      this.studySetsCurrentPage = maxPage;
    }
    this.closeDropdown();
  }

  playStudySet(id: number) {
    this.router.navigate(['/app/study-sets', id]);
  }

  toggleDropdown(index: number) {
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  togglePrivacy(id: number) {
    const allStudySets = this.getStudySetsFromStorage();
    const studySet = allStudySets.find(s => s.flashcard_id === id);
    if (studySet) {
      studySet.is_public = !studySet.is_public;
      this.saveStudySetsToStorage(allStudySets);
    }
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
      const allStudySets = this.getStudySetsFromStorage();
      const studySet = allStudySets.find(s => s.flashcard_id === this.selectedStudySetId);
      if (studySet) {
        studySet.is_public = true;
        this.saveStudySetsToStorage(allStudySets);
        
        console.log('Sharing study set:', {
          id: this.selectedStudySetId,
          title: this.shareTitle,
          category: this.shareCategory,
          description: this.shareDescription
        });
      }
      this.closeShareModal();
    }
  }
}