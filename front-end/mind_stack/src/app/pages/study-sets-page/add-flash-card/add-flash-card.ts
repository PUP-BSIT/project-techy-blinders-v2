import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FlashcardItem {
  keyTerm: string;
  definition: string;
}

@Component({
  selector: 'app-add-flash-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-flash-card.html',
  styleUrl: './add-flash-card.scss'
})
export class AddFlashCard implements OnChanges {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() studySetCreated = new EventEmitter<{ title: string; description: string; flashcards: FlashcardItem[]; isPublic: boolean }>();

  studySetTitle: string = '';
  studySetDescription: string = '';
  readonly MAX_SLOTS = 5;
  flashcards: FlashcardItem[] = Array.from({ length: 5 }, () => ({ keyTerm: '', definition: '' }));
  visibleSlotsCount: number = 1;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  addFlashcard() {
    if (this.visibleSlotsCount < this.MAX_SLOTS) {
      this.visibleSlotsCount++;
    }
  }

  removeFlashcard(index: number) {
    if (index >= 0 && index < this.flashcards.length) {
      this.flashcards[index] = { keyTerm: '', definition: '' };
      if (index === this.visibleSlotsCount - 1 && this.visibleSlotsCount > 1) {
        this.visibleSlotsCount--;
      }
    }
  }

  close() {
    document.body.style.overflow = '';
    this.closeModal.emit();
    this.resetForm();
  }

  resetForm() {
    this.studySetTitle = '';
    this.studySetDescription = '';
    this.flashcards = Array.from({ length: this.MAX_SLOTS }, () => ({ keyTerm: '', definition: '' }));
    this.visibleSlotsCount = 1;
  }

  savePrivate() {
    if (this.studySetTitle.trim() === '') {
      return;
    }
    this.studySetCreated.emit({
      title: this.studySetTitle,
      description: this.studySetDescription,
      flashcards: this.flashcards.filter(f => f.keyTerm.trim() !== '' || f.definition.trim() !== ''),
      isPublic: false
    });
    this.close();
  }

  publishPublic() {
    if (this.studySetTitle.trim() === '') {
      return;
    }
    this.studySetCreated.emit({
      title: this.studySetTitle,
      description: this.studySetDescription,
      flashcards: this.flashcards.filter(f => f.keyTerm.trim() !== '' || f.definition.trim() !== ''),
      isPublic: true
    });
    this.close();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  get nonEmptyCount() {
    return this.flashcards.reduce((c, f) => c + ((f.keyTerm.trim() !== '' || f.definition.trim() !== '') ? 1 : 0), 0);
  }
}