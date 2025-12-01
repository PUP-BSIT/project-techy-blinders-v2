import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBar } from '../side-bar/side-bar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SideBar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss'
})
export class AppLayout {
  isSidebarCollapsed = false;

  onSidebarToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
}