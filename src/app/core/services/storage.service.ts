import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly PREFIX = 'traveller-architect-';

  constructor() { }

  save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  load<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error loading from localStorage', e);
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  clearAll(): void {
    // Only clear items with our prefix to avoid messing with other apps on localhost
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}
