import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudySet, StudySetsService } from '../../../services/study-sets.service';

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
  isLoading: boolean = false;
  errorMessage: string = '';

  private studySetsService = inject(StudySetsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudySet(Number(id));
    } else {
      this.errorMessage = 'No study set ID provided';
    }
  }

  loadStudySet(id: number) {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.studySetsService.getStudySetById(id).subscribe({
      next: (studySet) => {
        this.studySet = studySet;
        this.isLoading = false;
        
        // Reset card index if there are no flashcards
        if (!studySet.flashcards || studySet.flashcards.length === 0) {
          this.currentCardIndex = 0;
        }
      },
      error: (error) => {
        console.error('Error loading study set:', error);
        this.errorMessage = 'Failed to load study set. Please try again.';
        this.isLoading = false;
        this.studySet = null;
      }
    });
  }

  get currentCard() {
    if (!this.studySet || !this.studySet.flashcards || this.studySet.flashcards.length === 0) {
      return null;
    }
    return this.studySet.flashcards[this.currentCardIndex];
  }

  get totalCards() {
    return this.studySet?.flashcards?.length || 0;
  }

  get hasFlashcards() {
    return this.totalCards > 0;
  }

  toggleDefinition() {
    if (this.hasFlashcards) {
      this.isDefinitionRevealed = !this.isDefinitionRevealed;
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

  goBack() {
    this.router.navigate(['/app/study-sets']);
  }
}