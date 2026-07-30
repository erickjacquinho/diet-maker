import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Clear localStorage before each test run
beforeEach(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
});
