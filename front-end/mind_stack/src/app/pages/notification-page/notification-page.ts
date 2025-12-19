import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationItem } from '../../../service/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-page.html',
  styleUrl: './notification-page.scss'
})
export class NotificationPage implements OnInit {
  private notificationsService = inject(NotificationService);
  private router = inject(Router);
  activeFilter: 'all' | 'unread' = 'all';
  now = signal<Date>(new Date());

  notifications = signal<NotificationItem[]>([]);

  constructor() {
    this.notificationsService.notifications$.subscribe(list => this.notifications.set(list));
    this.notificationsService.refresh();
    setInterval(() => this.now.set(new Date()), 15000);
  }

  ngOnInit(): void {
    // Ensure a fresh pull whenever this page is instantiated
    this.notificationsService.refresh();
  }

  setFilter(filter: 'all' | 'unread') {
    this.activeFilter = filter;
  }

  toggleReadStatus(notification: NotificationItem) {
    // Mark as read if unread
    if (!notification.isRead) {
      this.notificationsService.markAsRead(notification.notificationId);
    }
    // Navigate to target content based on type & ids
    this.navigateToTarget(notification);
  }

  private navigateToTarget(n: NotificationItem) {
    // Default route to community with optional query params
    const qp: any = {};
    if (n.postId) qp.postId = n.postId;
    if (n.commentId) qp.commentId = n.commentId;

    // For known types, ensure we land on Community page
    // Types: POST_LIKE, POST_DISLIKE, POST_COMMENT -> post
    //        COMMENT_LIKE, COMMENT_DISLIKE, COMMENT_REPLY -> comment
    this.router.navigate(['/app/community'], { queryParams: qp });
  }

  get filteredNotifications() {
    const list = this.notifications();
    if (this.activeFilter === 'unread') {
      return list.filter(n => !n.isRead);
    }
    return list;
  }

  getTimeAgo(date: Date): string {
    // Always show: Mon DD, HH:MM AM/PM (e.g., Dec 16, 9:59 PM)
    const d = new Date(date);
    const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${datePart}, ${timePart}`;
  }

  getActorInitial(message: string): string {
    // Extract username from message like "mikemike commented on your post."
    const match = message.match(/^([^\s]+)/);
    if (match && match[1]) {
      return match[1].charAt(0).toUpperCase();
    }
    return 'U';
  }
}
