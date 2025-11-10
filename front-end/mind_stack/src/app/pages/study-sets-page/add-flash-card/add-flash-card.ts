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
  flashcards: FlashcardItem[] = [
    { keyTerm: '', definition: '' }
  ];

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
    this.flashcards.push({ keyTerm: '', definition: '' });
  }

  removeFlashcard(index: number) {
    if (this.flashcards.length > 1) {
      this.flashcards.splice(index, 1);
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
    this.flashcards = [
      { keyTerm: '', definition: '' }
    ];
  }

  savePrivate() {
    if (this.studySetTitle.trim() === '') {
      return;
    }
    this.studySetCreated.emit({
      title: this.studySetTitle,
      description: this.studySetDescription,
      flashcards: this.flashcards,
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
      flashcards: this.flashcards,
      isPublic: true
    });
    this.close();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
}