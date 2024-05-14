import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['public/scripts/**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
];
