import { Routes } from '@angular/router';
import { Signup} from './pages/signup/signup';

export const routes: Routes = [
  // This route redirects the empty path to 'login'
 {
    path: '',
    pathMatch: 'full',
    loadComponent:() => {return import('./pages/login/login').then((m) => m.LoginComponent)
    },
},

  // The login route. The path should be a simple string.
  {
    path: 'signup',
    pathMatch: 'full',
    loadComponent:() => {
        return import('./pages/signup/signup').then((m) => m.Signup)
    },
},
 {
    path: 'login',
    pathMatch: 'full',
    loadComponent:() => {return import('./pages/login/login').then((m) => m.LoginComponent)
    },
},
{
    path: 'home',
    pathMatch: 'full',
    loadComponent:() => {
        return import('./pages/home/home').then((m) => m.Home)
    },
},
{
    path: 'set-balance',
    pathMatch: 'full',
    loadComponent:() => {
        return import('./pages/initial-balance/initial-balance').then((m) => m.InitialBalance)
    },
},
{
    path: 'loan',
    pathMatch: 'full',
    loadComponent:() => {
        return import('./pages/loansprediction/loansprediction').then((m) => m.Loansprediction)
    },
},

];
