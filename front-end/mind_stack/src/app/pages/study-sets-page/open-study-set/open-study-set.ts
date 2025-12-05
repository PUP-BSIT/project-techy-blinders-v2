import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

export interface StudySet {
  flashcard_id: number;
  title: string;
  description: string;
  flashcards: { keyTerm: string; definition: string }[];
  created_at: Date;
  is_public: boolean;
}

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

  private readonly STORAGE_KEY = 'studySets';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudySet(Number(id));
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

  loadStudySet(id: number) {
    const studySets = this.getStudySetsFromStorage();
    const foundSet = studySets.find(s => s.flashcard_id === id) || null;
    this.studySet = foundSet;
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