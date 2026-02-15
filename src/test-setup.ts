import 'zone.js';
import 'zone.js/testing';
import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Initialize Angular Testing Environment
try {
  TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch (e) {
  // Already initialized
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; }
  };
})();

// Assign to both global and window to handle different execution contexts
vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('sessionStorage', localStorageMock);

if (typeof window !== 'undefined') {
  // Ensure window also has it if it's not the same as global
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
  Object.defineProperty(window, 'sessionStorage', { value: localStorageMock, writable: true });
}
