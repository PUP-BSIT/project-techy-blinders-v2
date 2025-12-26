import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { DashboardService } from '../../../service/dashboard.service';

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
        this.userEmail = data.userEmail;
        this.flashcardCount = data.flashcardCount;
        this.quizCount = data.quizCount;
        this.recentActivities = [];
        this.isLoading = false;
      },
      error: () => {
        this.userName = currentUser.username;
        this.userId = currentUser.userId.toString();
        this.userEmail = currentUser.email;
        this.flashcardCount = 0;
        this.quizCount = 0;
        this.recentActivities = [];
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
