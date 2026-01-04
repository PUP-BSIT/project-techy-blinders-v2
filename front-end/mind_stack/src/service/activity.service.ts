import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Activity, ActivityRequest } from '../app/models/activity.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private authService = inject(AuthService);
  
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);
  public activities$ = this.activitiesSubject.asObservable();
  private currentUserId: number | null = null;

  constructor() {
    // Don't load activities in constructor - wait for user to be authenticated
  }

  addActivity(activityRequest: ActivityRequest): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Ensure activities are loaded for current user first
    this.ensureActivitiesLoaded();

    const currentActivities = this.activitiesSubject.value;
    
    const isDuplicate = this.isDuplicateActivity(activityRequest, currentActivities);
    if (isDuplicate) {
      this.updateExistingActivity(activityRequest, currentActivities);
      return;
    }

    const activity: Activity = {
      id: this.generateId(),
      type: activityRequest.type,
      title: activityRequest.title,
      timestamp: new Date(),
      studySetId: activityRequest.studySetId,
      quizSetId: activityRequest.quizSetId,
      score: activityRequest.score
    };

    const updatedActivities = [activity, ...currentActivities].slice(0, 10); // Keep only last 10 activities
    
    this.activitiesSubject.next(updatedActivities);
    this.saveActivities(updatedActivities);
  }

  getRecentActivities(): Activity[] {
    this.ensureActivitiesLoaded();
    return this.activitiesSubject.value;
  }

  private ensureActivitiesLoaded(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.activitiesSubject.next([]);
      this.currentUserId = null;
      return;
    }

    // If user changed, reload activities
    if (this.currentUserId !== currentUser.userId) {
      this.loadActivitiesForUser(currentUser.userId);
      this.currentUserId = currentUser.userId;
    }
  }

  private loadActivitiesForUser(userId: number): void {
    const storageKey = `activities_${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const activities = JSON.parse(stored).map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
        this.activitiesSubject.next(activities);
      } catch (error) {
        console.error('Error loading activities:', error);
        this.activitiesSubject.next([]);
      }
    } else {
      this.activitiesSubject.next([]);
    }
  }

  private saveActivities(activities: Activity[]): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const storageKey = `activities_${currentUser.userId}`;
    localStorage.setItem(storageKey, JSON.stringify(activities));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private isDuplicateActivity(activityRequest: ActivityRequest, currentActivities: Activity[]): boolean {
    return currentActivities.some(activity => {
      // Check if it's the same type and title
      if (activity.type !== activityRequest.type || activity.title !== activityRequest.title) {
        return false;
      }

      // For flashcards, check studySetId
      if (activityRequest.type === 'flashcard' && activityRequest.studySetId) {
        return activity.studySetId === activityRequest.studySetId;
      }

      // For quizzes, check quizSetId
      if (activityRequest.type === 'quiz' && activityRequest.quizSetId) {
        return activity.quizSetId === activityRequest.quizSetId;
      }

      // If no specific ID to match, consider it duplicate if type and title match
      return true;
    });
  }

  private updateExistingActivity(activityRequest: ActivityRequest, currentActivities: Activity[]): void {
    const existingActivityIndex = currentActivities.findIndex(activity => {
      // Find the matching activity using same logic as isDuplicateActivity
      if (activity.type !== activityRequest.type || activity.title !== activityRequest.title) {
        return false;
      }

      if (activityRequest.type === 'flashcard' && activityRequest.studySetId) {
        return activity.studySetId === activityRequest.studySetId;
      }

      if (activityRequest.type === 'quiz' && activityRequest.quizSetId) {
        return activity.quizSetId === activityRequest.quizSetId;
      }

      return true;
    });

    if (existingActivityIndex !== -1) {
      // Update the existing activity's timestamp and score (for quizzes)
      const updatedActivities = [...currentActivities];
      const existingActivity = updatedActivities[existingActivityIndex];
      
      // Update timestamp to current time
      existingActivity.timestamp = new Date();
      
      // Update score if it's a quiz with new score data
      if (activityRequest.type === 'quiz' && activityRequest.score) {
        existingActivity.score = activityRequest.score;
      }

      // Move the updated activity to the front of the list
      updatedActivities.splice(existingActivityIndex, 1);
      updatedActivities.unshift(existingActivity);

      this.activitiesSubject.next(updatedActivities);
      this.saveActivities(updatedActivities);
    }
  }

  // Method to clear activities when user logs out
  clearActivities(): void {
    this.activitiesSubject.next([]);
    this.currentUserId = null;
  }

  // Method to reset/clear all activities for current user
  resetActivities(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Clear from memory
    this.activitiesSubject.next([]);
    
    // Clear from localStorage
    const storageKey = `activities_${currentUser.userId}`;
    localStorage.removeItem(storageKey);
  }

  deleteActivity(activityId: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.ensureActivitiesLoaded();
    
    const currentActivities = this.activitiesSubject.value;
    const updatedActivities = currentActivities.filter(activity => activity.id !== activityId);
    
    this.activitiesSubject.next(updatedActivities);
    this.saveActivities(updatedActivities);
  }
}