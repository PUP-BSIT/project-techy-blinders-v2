import { Routes } from '@angular/router';
import { AboutPage } from './pages/about-page/about-page';
import { ContactPage } from './pages/contact-page/contact-page';
import { LandingPage } from './pages/landing-page/landing-page';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { StudySetsPage } from './pages/study-sets-page/study-sets-page';
import { QuizzesPage } from './pages/quizzes-page/quizzes-page';
import { CommunityPage } from './pages/community-page/community-page';
import { NotificationPage } from './pages/notification-page/notification-page';
import { AppLayout } from './shared/components/app-layout/app-layout';
import { LoginPage } from './pages/login-page/login-page';
import { RegistrationPage } from './pages/registration-page/registration-page';

export const routes: Routes = [
    {path: '', component: LandingPage },  
    {path: 'about', component: AboutPage },
    {path: 'contact', component: ContactPage },
    {path: 'login', component: LoginPage},
    {path: 'registration', component: RegistrationPage},

    { 
        path: 'app',
        component: AppLayout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardPage },
            { path: 'study-sets', component: StudySetsPage },
            { path: 'quizzes', component: QuizzesPage },
            { path: 'community', component: CommunityPage },
            { path: 'notifications', component: NotificationPage },
        ]
    },

    { path: '**', redirectTo: '' }  
];