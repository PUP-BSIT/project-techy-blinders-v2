import { Component } from '@angular/core';
import { SideBar } from '../../shared/components/side-bar/side-bar';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [SideBar],
  templateUrl: './notification-page.html',
  styleUrl: './notification-page.scss'
})
export class NotificationPage {

}
