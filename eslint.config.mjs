import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'web-build/',
      'android/',
      'ios/',
      'coverage/',
      '.agents/',
      'benchmarks/',
      'scratch/',
      'custom_build/',
      'functions/lib/',
      'functions/node_modules/',
      'scripts/',
      'eslint.config.mjs',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
      'eslint.config.js',
      'fix*.js',
      'apply*.js',
      '**/*.cjs',
      'test_game.ts',
      'test_automation.js',
      '**/*.d.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react: reactPlugin },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // TypeScript zaten tanımsız değişkenleri yakalar; no-undef TS'de gürültü üretir.
      'no-undef': 'off',
      'no-console': 'off',
      'no-empty': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
