import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private users = [
    { username: 'admin', password: 'admin', role: 'admin' },
    { username: 'emp', password: 'emp', role: 'employee' }
  ];

  login(username: string, password: string): boolean {
    const user = this.users.find(u => u.username === username && u.password === password);
    if (user) {
      const loggedInUser: User = { username: user.username, role: user.role };
      this.currentUserSubject.next(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  initializeAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }
}