import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudySetsService, StudySet } from '../../services/study-sets.service';

@Component({
  selector: 'app-study-sets-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './study-sets-page.html',
  styleUrls: ['./study-sets-page.scss']
})
export class StudySetsPage {
  isModalOpen: boolean = false;
  isConfirmModalOpen: boolean = false;
  studySetTitle: string = '';
  studySetDescription: string = '';
  flashcards: { term: string; definition: string }[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 2;
  studySetsCurrentPage: number = 0;
  studySetsPerPage: number = 4;
  editingStudySetId: number | null = null;

  constructor(
    private studySetsService: StudySetsService,
    private router: Router
  ) {}

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

  get studySetsPages(): number[] {
    return Array.from({ length: this.studySetsTotalPages }, (_, i) => i);
  }

  goToStudySetsPage(page: number) {
    this.studySetsCurrentPage = page;
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
}