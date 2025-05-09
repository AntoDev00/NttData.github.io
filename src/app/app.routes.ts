import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      }
    ]
  },
  {
    path: 'posts',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./posts/post-list/post-list.component').then(m => m.PostListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./posts/post-detail/post-detail.component').then(m => m.PostDetailComponent)
      }
    ]
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];
