// ESLint v9 flat config — covers both the React frontend (src/) and the Node.js backend (server/).
// We deliberately keep rules pragmatic for an existing codebase: warn on stylistic issues, error on real bugs.
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'server/uploads/**',
      'prisma/migrations/**',
      '.qoder/**',
    ],
  },

  // Base recommended rules for everything.
  js.configs.recommended,

  // Frontend (React + browser globals)
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // We use the new JSX runtime (automatic), so importing React is not required.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // Project doesn't use prop-types; relying on conventions for now.
      'react/no-unescaped-entities': 'off', // Vietnamese punctuation triggers false positives.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },

  // Backend (Node.js)
  {
    files: ['server/**/*.js', 'prisma/seed.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2024,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^next$', varsIgnorePattern: '^_' }],
      'no-console': 'off', // Server logs are fine.
    },
  },

  // Disable rules that conflict with Prettier — must be last.
  prettier,
]
