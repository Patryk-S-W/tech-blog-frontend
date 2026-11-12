import { environment } from './environment.prod';

describe('production API configuration', () => {
  it('keeps browser API requests same-origin', () => {
    expect(environment.production).toBe(true);
    expect(environment.apiUrl).toBe('');
  });
});
