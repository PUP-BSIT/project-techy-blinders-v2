import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../service/auth.service';
import { DashboardService } from '../../../service/dashboard.service';
import { ActivityService } from '../../../service/activity.service';
import { Activity } from '../../models/activity.model';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private activityService = inject(ActivityService);

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
    this.loadRecentActivities();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRecentActivities() {
    this.activityService.activities$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activities => {
        this.recentActivities = activities;
      });

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.activityService.getRecentActivities();
        } else {
          this.recentActivities = [];
          this.activityService.clearActivities();
        }
      });
  }

  private loadDashboardData() {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.dashboardService.getDashboardData(currentUser.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.userName = data.userName;
          this.userId = data.userId.toString();
          this.userEmail = data.userEmail;
          this.flashcardCount = data.flashcardCount;
          this.quizCount = data.quizCount;
          this.isLoading = false;
        },
        error: () => {
          this.userName = currentUser.username;
          this.userId = currentUser.userId.toString();
          this.userEmail = currentUser.email;
          this.flashcardCount = 0;
          this.quizCount = 0;
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

  navigateToActivity(activity: Activity) {
    if (activity.type === 'quiz' && activity.quizSetId) {
      this.router.navigate(['/app/quizzes', activity.quizSetId]);
    } else if (activity.type === 'flashcard' && activity.studySetId) {
      this.router.navigate(['/app/study-sets', activity.studySetId]);
    }
  }

  getActivityDescription(activity: Activity): string {
    return activity.type === 'quiz' ? 'Quiz Set' : 'Flashcard Set';
  }

  resetActivities(): void {
    this.activityService.resetActivities();
  }

  navigateToQuizzes() {
    this.router.navigate(['/app/quizzes']);
  }

  navigateToFlashcards() {
    this.router.navigate(['/app/study-sets']);
  }


}
