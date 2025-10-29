import { Routes } from '@angular/router';
import { AboutPage } from './pages/about-page/about-page';
import { ContactPage } from './pages/contact-page/contact-page';
import { NavBar } from './shared/components/nav-bar/nav-bar';
import { LandingPage } from './pages/landing-page/landing-page';
export const routes: Routes = [
    { path: '', component: LandingPage },  
    { path: 'about', component: AboutPage },
    { path: 'contact', component: ContactPage },
    { path: '**', redirectTo: '' }  
];