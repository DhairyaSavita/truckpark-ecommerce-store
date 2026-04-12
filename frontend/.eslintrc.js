module.exports = {
  extends: ['react-app'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': 'warn',
    'react/jsx-no-undef': 'error'
  },
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        'no-unused-vars': ['warn', { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }]
      }
    }
  ]
};
