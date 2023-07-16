module.exports = {
  'env': {
    'commonjs': true,
    'es2021': true,
    'node': true,
  },
  'extends': 'google',
  'overrides': [
    {
      'env': {
        'node': true,
      },
      'files': [
        '.eslintrc.{js,cjs}',
      ],
      'parserOptions': {
        'sourceType': 'script',
      },
    },
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'rules': {
    'no-throw-literal': 0,
    'max-len': 0,
  },
};
