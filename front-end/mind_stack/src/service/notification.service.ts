import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface NotificationItem {
  notificationId: string;
  userId: string; 
  actorUserId?: string | null;
  postId?: string | null;
  commentId?: string | null;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly apiUrl = '/api/notifications';

  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.refresh();
  }

  refresh(): void {
    const currentUser = this.auth.getCurrentUser();
    const userId = currentUser?.userId;
    if (!userId) {
      this.notificationsSubject.next([]);
      return;
    }
    this.http.get<any[]>(`${this.apiUrl}/user/${userId}`).subscribe({
      next: list => {
        const mapped = (list || []).map(n => this.mapFromApi(n));
        this.notificationsSubject.next(this.sortByNewest(mapped));
      },
      error: err => {
        console.error('Failed to load notifications', err);
        this.notificationsSubject.next([]);
      }
    });
  }

  markAsRead(notificationId: string): void {
    // Optimistic update
    const prev = this.notificationsSubject.value;
    const optimistic = prev.map(n =>
      n.notificationId === notificationId ? { ...n, isRead: true } : n
    );
    this.notificationsSubject.next(optimistic);

    this.http.patch(`${this.apiUrl}/${notificationId}/read`, {}).subscribe({
      next: () => {
        // Re-sync from backend to ensure persistence/state stays accurate
        this.refresh();
      },
      error: err => {
        console.error('Failed to mark notification as read', err);
        this.notificationsSubject.next(prev);
      }
    });
  }

  removeNotificationsByPostId(postId: string): void {
    const filtered = this.notificationsSubject.value.filter(n => n.postId !== postId);
    this.notificationsSubject.next(filtered);
  }

  removeNotificationsByCommentId(commentId: string): void {
    const filtered = this.notificationsSubject.value.filter(n => n.commentId !== commentId);
    this.notificationsSubject.next(filtered);
  }

  private mapFromApi(n: any): NotificationItem {
    return {
      notificationId: String(n.notificationId ?? n.notifId ?? n.id ?? ''),
      userId: String(n.userId ?? ''),
      actorUserId: n.actorUserId != null ? String(n.actorUserId) : null,
      postId: n.postId != null ? String(n.postId) : null,
      commentId: n.commentId != null ? String(n.commentId) : null,
      type: n.type ?? '',
      message: n.message ?? '',
      isRead: Boolean(n.isRead ?? n.read ?? false),
      createdAt: this.parseBackendDate(n.createdAt ?? n.isCreatedAt ?? n.created_at ?? new Date())
    };
  }

  private parseBackendDate(value: any): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    let s = String(value).trim();
    // Treat backend timestamps as local time (no timezone conversion)
    // e.g., "2025-12-15 21:59:47" -> "2025-12-15T21:59:47"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
      s = s.replace(' ', 'T');
      return new Date(s);
    }
    // Already ISO without timezone -> parse as local
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
      return new Date(s);
    }
    // Fallback
    return new Date(s);
  }

  private sortByNewest(items: NotificationItem[]): NotificationItem[] {
    return [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
