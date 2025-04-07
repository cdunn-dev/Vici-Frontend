import { add } from './index';

test('add function', () => {
  const result = add(1, 2);
  expect(result).toBe(3);
}); 