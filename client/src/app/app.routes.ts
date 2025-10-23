import { Routes } from '@angular/router';
import { CustomerAppComponent } from './customer/customer-app.component';
import { DashboardAppComponent } from './dashboard/dashboard-app.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/customer',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'customer',
    component: CustomerAppComponent
  },
  {
    path: 'dashboard',
    component: DashboardAppComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];