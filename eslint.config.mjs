import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default [
  {
    files: ['**/*.js', '**/*.jsx'], //파일 지정: 설정이 적용될 파일 유형을 명시(files).
    languageOptions: {
      //언어 옵션: ECMAScript 버전, 모듈 형식 등 지정.
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      //규칙: 린팅 규칙을 정의.
      'no-unused-vars': 'warn',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  },
];
