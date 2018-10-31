/* @flow */

import pointRectDistance from './pointRectDistance';

test('works', () => {
  expect(pointRectDistance(20,30, 40,20,100,100)).toBe(20);
  expect(pointRectDistance(5,10, 8,14,100,100)).toBe(5);
  expect(pointRectDistance(8,19, 5,10,5,5)).toBe(4);
  expect(pointRectDistance(13,19, 5,10,5,5)).toBe(5);

  expect(pointRectDistance(7,12, 5,10,5,5)).toBe(0);
});
