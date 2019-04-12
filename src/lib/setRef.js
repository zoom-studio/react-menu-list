/* @flow */

import type {Ref} from 'react';

export default function setRef(ref: Ref<any>, value: any) {
  // If a more proper way to compose refs ever happens, then do that here.
  // https://github.com/facebook/react/issues/13029
  if (typeof ref === 'function') {
    ref(value);
  } else {
    /*:: if (typeof ref === 'string' || typeof ref === 'number') throw new Error(); */
    ref.current = value;
  }
}
