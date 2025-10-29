import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { NavBar } from './shared/components/nav-bar/nav-bar';
import { LandingPage } from './pages/landing-page/landing-page';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, RouterLinkActive, LandingPage],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('mind_stack');
}
