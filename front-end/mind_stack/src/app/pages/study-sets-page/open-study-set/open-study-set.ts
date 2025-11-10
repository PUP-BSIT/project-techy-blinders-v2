import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudySetsService, StudySet } from '../../../services/study-sets.service';

@Component({
  selector: 'app-open-study-set',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './open-study-set.html',
  styleUrl: './open-study-set.scss'
})
export class OpenStudySet implements OnInit {
  studySet: StudySet | null = null;
  currentCardIndex: number = 0;
  isDefinitionRevealed: boolean = false;
  shuffled: boolean = false;
  originalFlashcards: { keyTerm: string; definition: string }[] = [];

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
    if (this.studySet) {
      this.originalFlashcards = [...this.studySet.flashcards];
      if (this.studySet.flashcards.length === 0) {
        this.currentCardIndex = 0;
      }
    }
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

  get masteryCount() {
    return this.currentCardIndex;
  }

  revealDefinition() {
    this.isDefinitionRevealed = true;
  }

  hideDefinition() {
    this.isDefinitionRevealed = false;
  }

  toggleDefinition() {
    if (this.isDefinitionRevealed) {
      this.hideDefinition();
    } else {
      this.revealDefinition();
    }
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

  shuffleCards() {
    if (!this.studySet) return;
    
    if (this.shuffled) {
      this.studySet.flashcards = [...this.originalFlashcards];
      this.shuffled = false;
    } else {
      const shuffled = [...this.studySet.flashcards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      this.studySet.flashcards = shuffled;
      this.shuffled = true;
    }
    this.currentCardIndex = 0;
    this.isDefinitionRevealed = false;
  }

  flagCard() {
    console.log('Flag card:', this.currentCard);
  }

  startQuiz() {
    console.log('Start quiz for study set:', this.studySet?.flashcard_id);
  }

  savePrivate() {
    if (!this.studySet) return;
    this.studySet.is_public = false;
    this.studySetsService.updateStudySet(this.studySet);
  }

  publishPublic() {
    if (!this.studySet) return;
    this.studySet.is_public = true;
    this.studySetsService.updateStudySet(this.studySet);
  }

  goBack() {
    this.router.navigate(['/app/study-sets']);
  }
}