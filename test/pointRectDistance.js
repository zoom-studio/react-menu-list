/* @flow */

import assert from 'assert';
import pointRectDistance from '../src/lib/pointRectDistance';

describe('pointRectDistance', function() {
  it('works', function() {
    assert.strictEqual(pointRectDistance(20,30, 40,20,100,100), 20);
    assert.strictEqual(pointRectDistance(5,10, 8,14,100,100), 5);
    assert.strictEqual(pointRectDistance(8,19, 5,10,5,5), 4);
    assert.strictEqual(pointRectDistance(13,19, 5,10,5,5), 5);

    assert.strictEqual(pointRectDistance(7,12, 5,10,5,5), 0);
  });
});
