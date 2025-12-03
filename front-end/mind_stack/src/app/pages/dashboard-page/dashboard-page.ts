import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface StudyItem {
  id: string;
  name: string;
  type: 'flashcard' | 'quiz';
  flashcardCount?: number;
}

interface Activity {
  id: string;
  type: 'flashcard' | 'quiz';
  title: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {

  progressPercentage: number = 50;
  flashcardCount: number = 0;
  quizCount: number = 0;
  streakDays: number = 0;
  userName: string = 'John Doe';
  userId: string = '82739120';


  studyLibrary: StudyItem[] = [
    { id: '1', name: 'Object Oriented Programming', type: 'flashcard', flashcardCount: 15 },
    { id: '2', name: 'Advance Programming', type: 'flashcard', flashcardCount: 20 },
    { id: '3', name: 'Web Development', type: 'flashcard', flashcardCount: 12 },
    { id: '4', name: 'Project Management', type: 'flashcard', flashcardCount: 18 },
    { id: '5', name: 'Application Development', type: 'flashcard', flashcardCount: 18 }
  ];

  recentActivities: Activity[] = [
    { id: '1', type: 'flashcard', title: 'Advance Programming', timestamp: new Date() },
    { id: '2', type: 'flashcard', title: 'Advance Programming', timestamp: new Date() },
    { id: '3', type: 'flashcard', title: 'Advance Programming', timestamp: new Date() },
    { id: '4', type: 'flashcard', title: 'Advance Programming', timestamp: new Date() },
    { id: '5', type: 'flashcard', title: 'Advance Programming', timestamp: new Date() }
  ];

  constructor(private router: Router) {}

  getStrokeDashoffset(): number {
    const circumference = 2 * Math.PI * 54;
    return circumference - (this.progressPercentage / 100) * circumference;
  }

  createFlashcards() {
    console.log('Navigate to create flashcards');
    this.router.navigate(['/app/study-sets'], { queryParams: { create: 'true' } });
  }

  createQuiz() {
    console.log('Navigate to create quiz');
    this.router.navigate(['/quizzes']);
  }

  viewStudyItem(item: StudyItem) {
    console.log('Viewing study item:', item.name);
    if (item.type === 'flashcard') {
      this.router.navigate(['/study-sets', item.id]);
    } else {
      this.router.navigate(['/quizzes', item.id]);
    }
  }

  getActivityIcon(type: string): string {
    return type === 'quiz' ? 'assets/Clipboard.png' : 'assets/book.png';
  }
}
