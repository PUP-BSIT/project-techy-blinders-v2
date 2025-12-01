import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddFlashCard } from './add-flash-card/add-flash-card';
import { StudySetsService, StudySet } from '../../services/study-sets.service';

@Component({
  selector: 'app-study-sets-page',
  standalone: true,
  imports: [AddFlashCard, CommonModule],
  templateUrl: './study-sets-page.html',
  styleUrls: ['./study-sets-page.scss']
})
export class StudySetsPage {
  isModalOpen: boolean = false;

  constructor(
    private studySetsService: StudySetsService
  ) {}

  openModal() {
    this.isModalOpen = false;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveStudySet(studySetData: { title: string; description: string; flashcards: { keyTerm: string; definition: string }[]; isPublic: boolean }) {
    const newStudySet: StudySet = {
      flashcard_id: Date.now(),
      title: studySetData.title,
      description: studySetData.description,
      flashcards: studySetData.flashcards.filter(f => f.keyTerm.trim() !== '' || f.definition.trim() !== ''),
      created_at: new Date(),
      is_public: studySetData.isPublic
    };
    
    this.studySetsService.addStudySet(newStudySet);
  }
}