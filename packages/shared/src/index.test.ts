import { add } from './index';

describe('index', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      const result = add(1, 2);
      expect(result).toBe(3);
    });
  });
}); 