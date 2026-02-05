import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

import { UserData } from '../types/login.type';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userDataSubject = new BehaviorSubject<UserData | null>(null);
  userData$ = this.userDataSubject.asObservable();

  constructor() {
    this.loadUserData();
  }

  // =====================
  // Load user on app start
  // =====================
  private loadUserData(): void {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        this.userDataSubject.next(JSON.parse(stored));
      } catch {
        this.logout();
      }
    }
  }

  // ==========
  // Auth
  // ==========
  login(user: UserData): void {
    if (!user.token) {
      throw new Error('توكن غير صالح');
    }

    this.userDataSubject.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('token', user.token);

    if (user.email) {
      localStorage.setItem('savedEmail', user.email);
    }
  }

  logout(): void {
    this.userDataSubject.next(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('savedEmail');
  }

  // ==========
  // Getters
  // ==========
  getUserData(): UserData | null {
    return this.userDataSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getSavedEmail(): string | null {
    return localStorage.getItem('savedEmail');
  }

  // ==========
  // State
  // ==========
  isLoggedIn$ = this.userData$.pipe(
    map(user => !!user)
  );
}
