import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddFlashCard } from './add-flash-card/add-flash-card';
import { StudySetsService, StudySet } from '../../services/study-sets.service';

@Component({
  selector: 'app-study-sets-page',
  standalone: true,
  imports: [AddFlashCard, CommonModule],
  templateUrl: './study-sets-page.html',
  styleUrls: ['./study-sets-page.scss']
})
export class StudySetsPage implements OnInit {
  isModalOpen: boolean = false;
  studySets: StudySet[] = [];

  constructor(
    private router: Router, 
    private studySetsService: StudySetsService
  ) {}

  ngOnInit() {
    this.loadStudySets();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.loadStudySets();
  }

  loadStudySets() {
    this.studySets = this.studySetsService.getStudySets();
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
    this.loadStudySets();
  }

  deleteStudySet(flashcardId: number, event: Event) {
    event.stopPropagation();
    this.studySetsService.deleteStudySet(flashcardId);
    this.loadStudySets();
  }

  openStudySet(flashcardId: number) {
    this.router.navigate(['/app/study-sets', flashcardId]);
  }
}