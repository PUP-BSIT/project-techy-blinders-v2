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
  
  activitiesCurrentPage: number = 0;
  activitiesItemsPerPage: number = 3;
  activitiesTotalPages: number = 0;
  activitiesPages: (number | string)[] = [];
  paginatedActivities: Activity[] = [];

  // Delete modal properties
  isDeleteModalOpen: boolean = false;
  activityToDelete: Activity | null = null;
  hoveredActivityId: string | null = null;
  isClearAllModalOpen: boolean = false;

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
        this.updateActivitiesPagination();
      });

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.activityService.getRecentActivities();
        } else {
          this.recentActivities = [];
          this.activityService.clearActivities();
          this.updateActivitiesPagination();
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
    this.openClearAllModal();
  }

  openClearAllModal(): void {
    this.isClearAllModalOpen = true;
  }

  closeClearAllModal(): void {
    this.isClearAllModalOpen = false;
  }

  cancelClearAll(): void {
    this.closeClearAllModal();
  }

  confirmClearAll(): void {
    this.activityService.resetActivities();
    this.closeClearAllModal();
  }

  openDeleteModal(activity: Activity, event: Event): void {
    event.stopPropagation(); // Prevent navigation when clicking delete
    this.activityToDelete = activity;
    this.isDeleteModalOpen = true;
    this.hoveredActivityId = null; // Clear hover state when modal opens
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.activityToDelete = null;
  }

  cancelDelete(): void {
    this.closeDeleteModal();
  }

  confirmDelete(): void {
    if (this.activityToDelete) {
      this.activityService.deleteActivity(this.activityToDelete.id);
    }
    this.closeDeleteModal();
  }

  setHoverState(activityId: string, isHovered: boolean): void {
    this.hoveredActivityId = isHovered ? activityId : null;
  }

  getDeleteIconSrc(activityId: string): string {
    return this.hoveredActivityId === activityId 
      ? 'assets/delete-icon-hover.png' 
      : 'assets/delete-icon.png';
  }

  // Pagination methods for recent activities
  private updateActivitiesPagination() {
    this.activitiesTotalPages = Math.ceil(this.recentActivities.length / this.activitiesItemsPerPage);
    
    // Ensure we have at least 1 page if there are activities
    if (this.recentActivities.length > 0 && this.activitiesTotalPages === 0) {
      this.activitiesTotalPages = 1;
    }
    
    if (this.activitiesCurrentPage >= this.activitiesTotalPages && this.activitiesTotalPages > 0) {
      this.activitiesCurrentPage = this.activitiesTotalPages - 1;
    }
    
    this.updatePaginatedActivities();
    this.updateActivitiesPages();
  }

  private updatePaginatedActivities() {
    const startIndex = this.activitiesCurrentPage * this.activitiesItemsPerPage;
    const endIndex = startIndex + this.activitiesItemsPerPage;
    this.paginatedActivities = this.recentActivities.slice(startIndex, endIndex);
  }

  private updateActivitiesPages() {
    this.activitiesPages = [];
    
    // Always show at least one page if there are activities
    if (this.activitiesTotalPages === 0 && this.recentActivities.length > 0) {
      this.activitiesPages.push(0);
      return;
    }
    
    if (this.activitiesTotalPages <= 7) {
      for (let i = 0; i < this.activitiesTotalPages; i++) {
        this.activitiesPages.push(i);
      }
    } else {
      if (this.activitiesCurrentPage <= 3) {
        for (let i = 0; i < 5; i++) {
          this.activitiesPages.push(i);
        }
        this.activitiesPages.push('...');
        this.activitiesPages.push(this.activitiesTotalPages - 1);
      } else if (this.activitiesCurrentPage >= this.activitiesTotalPages - 4) {
        this.activitiesPages.push(0);
        this.activitiesPages.push('...');
        for (let i = this.activitiesTotalPages - 5; i < this.activitiesTotalPages; i++) {
          this.activitiesPages.push(i);
        }
      } else {
        this.activitiesPages.push(0);
        this.activitiesPages.push('...');
        for (let i = this.activitiesCurrentPage - 1; i <= this.activitiesCurrentPage + 1; i++) {
          this.activitiesPages.push(i);
        }
        this.activitiesPages.push('...');
        this.activitiesPages.push(this.activitiesTotalPages - 1);
      }
    }
  }

  goToActivitiesPage(page: number) {
    if (page >= 0 && page < this.activitiesTotalPages) {
      this.activitiesCurrentPage = page;
      this.updatePaginatedActivities();
      this.updateActivitiesPages();
    }
  }

  previousActivitiesPage() {
    if (this.activitiesCurrentPage > 0) {
      this.goToActivitiesPage(this.activitiesCurrentPage - 1);
    }
  }

  nextActivitiesPage() {
    if (this.activitiesCurrentPage < this.activitiesTotalPages - 1) {
      this.goToActivitiesPage(this.activitiesCurrentPage + 1);
    }
  }

  isPageNumber(page: number | string): boolean {
    return typeof page === 'number';
  }

  getPageNumber(page: number | string): number {
    return typeof page === 'number' ? page : 0;
  }

  getPageDisplay(page: number | string): string {
    return typeof page === 'number' ? String((page as number) + 1) : page as string;
  }

  navigateToQuizzes() {
    this.router.navigate(['/app/quizzes']);
  }

  navigateToFlashcards() {
    this.router.navigate(['/app/study-sets']);
  }


}
