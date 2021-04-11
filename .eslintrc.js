module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true,
  },
  'plugins': [
    'no-autofix',
  ],
  'extends': [
    // "eslint:recommended",
    './node_modules/sanctuary-style/eslint-es6.json',
  ],
  'settings': {
    'react': { 'version': 'detect' },
  },
  'parserOptions': {
    'ecmaVersion': 12,
    'ecmaFeatures': {
      'impliedStrict': true,
      'jsx': true,
    },
    'sourceType': 'module',
  },
  'rules': {
    'no-unused-vars': 'warn',
    // 'quotes': [ 'off'  ],
    'prefer-const': 'off',
    'no-autofix/prefer-const': [ 'warn', { 'destructuring': 'any' } ],
    'object-curly-spacing': [ 'error', 'always' ],
    'array-bracket-spacing': [ 'error', 'always' ],
    'comma-style': [ 'off' ],
    'max-len': [ 'warn', { 'code': 88 } ],
    'semi': [ 'warn', 'never' ],
    'func-call-spacing': [ 'warn', 'never' ],
    'comma-dangle': [ 'error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'never',
    } ],
    // "indent": [ "warn", 2 ],
  },
}
