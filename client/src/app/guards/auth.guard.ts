import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Initialize auth if not already done
  authService.initializeAuth();
  
  // Check both service state and localStorage
  const isAuthenticated = authService.isAuthenticated() || localStorage.getItem('currentUser') !== null;
  
  if (isAuthenticated) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};