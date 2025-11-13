import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'convert',
    loadComponent: () => import('./pages/convert/convert.page').then(m => m.ConvertPage)
  },
  {
    path: 'result',
    loadComponent: () => import('./pages/result/result.page').then(m => m.ResultPage)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then( m => m.HistoryPage)
  }
];