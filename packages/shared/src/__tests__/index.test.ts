import { add } from '../index';

describe('index', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(1, 2)).toBe(3);
    });
  });
}); 