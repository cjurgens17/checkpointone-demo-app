import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Callback } from './pages/callback/callback';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'callback', component: Callback },
  { path: 'dashboard', component: Dashboard },
  { path: '**', redirectTo: '' }
];
