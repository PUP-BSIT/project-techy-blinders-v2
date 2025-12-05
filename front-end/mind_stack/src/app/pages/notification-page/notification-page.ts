import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  userName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-page.html',
  styleUrl: './notification-page.scss'
})
export class NotificationPage {
  activeFilter: 'all' | 'latest' = 'all';
  
  notifications: Notification[] = [
    {
      id: 1,
      userName: 'Jane Dee',
      message: 'commented on your study set "study set title"',
      timestamp: '1 minute ago',
      isRead: false
    }
  ];

  setFilter(filter: 'all' | 'latest') {
    this.activeFilter = filter;
  }

  toggleReadStatus(notification: Notification) {
    notification.isRead = !notification.isRead;
  }

  get filteredNotifications() {
    if (this.activeFilter === 'latest') {
      return this.notifications.filter(n => !n.isRead);
    }
    return this.notifications;
  }
}
