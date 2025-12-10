import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { DashboardService } from '../../services/dashboard.service';

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
export class DashboardPage implements OnInit {

  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  progressPercentage: number = 50;
  flashcardCount: number = 0;
  quizCount: number = 0;
  streakDays: number = 0;
  userName: string = 'Loading...';
  userId: string = '';
  userEmail: string = '';
  isLoading: boolean = true;

  studyLibrary: StudyItem[] = [];

  recentActivities: Activity[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.dashboardService.getDashboardData(currentUser.userId).subscribe({
      next: (data) => {
        this.userName = data.userName;
        this.userId = data.userId.toString();
        this.flashcardCount = data.flashcardCount;
        this.quizCount = data.quizCount;
        
        this.studyLibrary = [
          ...data.recentFlashcards.map((fc: any) => ({
            id: fc.flashcardId?.toString() || fc.id?.toString(),
            name: fc.title || fc.flashcardTitle,
            type: 'flashcard' as const,
            flashcardCount: fc.flashcards?.length || 0
          })),
          ...data.recentQuizzes.map((quiz: any) => ({
            id: quiz.quizId?.toString() || quiz.id?.toString(),
            name: quiz.title || quiz.quizTitle,
            type: 'quiz' as const
          }))
        ].slice(0, 5);

        this.recentActivities = [
          ...data.recentFlashcards.map((fc: any) => ({
            id: fc.flashcardId?.toString() || fc.id?.toString(),
            type: 'flashcard' as const,
            title: fc.title || fc.flashcardTitle,
            timestamp: new Date(fc.createdAt || Date.now())
          })),
          ...data.recentQuizzes.map((quiz: any) => ({
            id: quiz.quizId?.toString() || quiz.id?.toString(),
            type: 'quiz' as const,
            title: quiz.title || quiz.quizTitle,
            timestamp: new Date(quiz.createdAt || Date.now())
          }))
        ].slice(0, 5);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.userName = currentUser.username;
        this.userId = currentUser.userId.toString();
        this.isLoading = false;
      }
    });
  }

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
    this.router.navigate(['/app/quizzes'], { queryParams: { create: 'true' } });
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

  navigateToQuizzes() {
    this.router.navigate(['/app/quizzes']);
  }

  navigateToFlashcards() {
    this.router.navigate(['/app/study-sets']);
  }
}
