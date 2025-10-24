import { Component, signal } from '@angular/core';
import { NavBar } from './shared/components/nav-bar/nav-bar';

@Component({
  selector: 'app-root',
  imports: [NavBar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('mind_stack');
}
