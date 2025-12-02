import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudySetsService, StudySet } from '../../../services/study-sets.service';

@Component({
  selector: 'app-open-study-set',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './open-study-set.html',
  styleUrls: ['./open-study-set.scss']
})
export class OpenStudySet implements OnInit {
  studySet: StudySet | null = null;
  currentCardIndex: number = 0;
  isDefinitionRevealed: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studySetsService: StudySetsService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudySet(Number(id));
    }
  }

  loadStudySet(id: number) {
    const foundSet = this.studySetsService.getStudySetById(id);
    this.studySet = foundSet || null;
  }

  get currentCard() {
    if (!this.studySet || this.studySet.flashcards.length === 0) {
      return null;
    }
    return this.studySet.flashcards[this.currentCardIndex];
  }

  get totalCards() {
    return this.studySet?.flashcards.length || 0;
  }

  toggleDefinition() {
    this.isDefinitionRevealed = !this.isDefinitionRevealed;
  }

  nextCard() {
    if (this.studySet && this.currentCardIndex < this.studySet.flashcards.length - 1) {
      this.currentCardIndex++;
      this.isDefinitionRevealed = false;
    }
  }

  previousCard() {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.isDefinitionRevealed = false;
    }
  }

  goBack() {
    this.router.navigate(['/app/study-sets']);
  }
}