/* @flow */
module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    jest: true,
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
    },
    sourceType: 'module',
  },
  plugins: ['react', 'flowtype'],
  settings: {
    react: {
      version: '16.6',
      flowVersion: '0.85',
    },
  },
  rules: {
    'flowtype/define-flow-type': 1,
    'flowtype/require-valid-file-annotation': ['error', 'always'],

    'linebreak-style': ['error', 'unix'],
    'no-var': ['error'],
  },
};
