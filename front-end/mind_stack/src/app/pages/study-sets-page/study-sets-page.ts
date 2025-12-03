import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StudySetsService, StudySet } from '../../services/study-sets.service';

@Component({
  selector: 'app-study-sets-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './study-sets-page.html',
  styleUrls: ['./study-sets-page.scss']
})
export class StudySetsPage implements OnInit {
  isModalOpen: boolean = false;
  isConfirmModalOpen: boolean = false;
  studySetTitle: string = '';
  studySetDescription: string = '';
  flashcards: { term: string; definition: string }[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 2;
  studySetsCurrentPage: number = 0;
  studySetsPerPage: number = 3;
  editingStudySetId: number | null = null;
  activeDropdown: number | null = null;

  constructor(
    private studySetsService: StudySetsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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

  get studySets(): StudySet[] {
    return this.studySetsService.getStudySets();
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
    this.flashcards = [];
    this.currentPage = 0;
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

  saveStudySet() {
    if (this.studySetTitle.trim()) {
      if (this.editingStudySetId !== null) {
        const updatedStudySet: StudySet = {
          flashcard_id: this.editingStudySetId,
          title: this.studySetTitle,
          description: this.studySetDescription,
          flashcards: this.flashcards.map(f => ({ 
            keyTerm: f.term, 
            definition: f.definition 
          })),
          created_at: new Date(),
          is_public: false
        };
        this.studySetsService.updateStudySet(updatedStudySet);
      } else {
        const newStudySet: StudySet = {
          flashcard_id: Date.now(),
          title: this.studySetTitle,
          description: this.studySetDescription,
          flashcards: this.flashcards.map(f => ({ 
            keyTerm: f.term, 
            definition: f.definition 
          })),
          created_at: new Date(),
          is_public: false
        };
        this.studySetsService.addStudySet(newStudySet);
      }
      this.closeModal();
    }
  }

  editStudySet(id: number) {
    const studySet = this.studySets.find(s => s.flashcard_id === id);
    if (studySet) {
      this.editingStudySetId = id;
      this.studySetTitle = studySet.title;
      this.studySetDescription = studySet.description || '';
      this.flashcards = studySet.flashcards.map(f => ({
        term: f.keyTerm,
        definition: f.definition
      }));
      this.currentPage = 0;
      this.isModalOpen = true;
    }
  }

  deleteStudySet(id: number) {
    this.studySetsService.deleteStudySet(id);
    const maxPage = Math.max(0, Math.ceil(this.studySets.length / this.studySetsPerPage) - 1);
    if (this.studySetsCurrentPage > maxPage) {
      this.studySetsCurrentPage = maxPage;
    }
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
    const studySet = this.studySets.find(s => s.flashcard_id === id);
    if (studySet) {
      studySet.is_public = !studySet.is_public;
      this.studySetsService.updateStudySet(studySet);
    }
    this.activeDropdown = null;
  }
}