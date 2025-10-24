import { Routes } from '@angular/router';
import { AboutPage } from './pages/about-page/about-page';
import { ContactPage } from './pages/contact-page/contact-page';
import { NavBar } from './shared/components/nav-bar/nav-bar';
import { Home } from './pages/home/home';

export const routes: Routes = [
    { path: '', component: Home },  
    { path: 'about', component: AboutPage },
    { path: 'contact', component: ContactPage },
    { path: '**', redirectTo: '' }  
];