import { describe, it, expect } from 'vitest';
import { generateAnonName, generateId, formatDate } from './helpers';

describe('Helpers unit tests', () => {
  it('generateAnonName should return a string starting with "Anon #"', () => {
    const name = generateAnonName();
    expect(name).toMatch(/^Anon #\d{4}$/); 
  });

  it('generateAnonName should have a number between 1000 and 9999', () => {
    const name = generateAnonName();
    const number = parseInt(name.split('#')[1]);
    expect(number).toBeGreaterThanOrEqual(1000); 
    expect(number).toBeLessThanOrEqual(9999); 
  });

  it('generateId should return a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generateId should produce unique values', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('formatDate should format valid ISO string correctly', () => {
    const date = '2025-01-26T10:00:00Z';
    const formatted = formatDate(date);
    expect(formatted).toContain('янв.'); 
  });

  it('formatDate should handle empty string by returning "Invalid Date"', () => {
    const formatted = formatDate('');
    expect(formatted).toBe('Invalid Date');
  });

  it('formatDate should handle nonsense strings', () => {
    const formatted = formatDate('not-a-real-date');
    expect(formatted).toBe('Invalid Date'); 
  });
});