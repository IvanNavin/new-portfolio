module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'prettier',
    'simple-import-sort',
    'import',
  ],
  rules: {
    'import/extensions': 'off',
    'react/react-in-jsx-scope': 'off',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'import/prefer-default-export': 'off',
    'import/no-named-as-default': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.ts', '**/*.tsx'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // First packages that start with characters.
              ['^[a-z]'],
              // Packages starting with `@`
              ['^@'],
              // Imports starting with `../`
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Imports starting with `./`
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              // Side effect imports
              ['^\\u0000'],
              // Style imports
              ['^(\\.|\\..)/.+\\.(sa|c)ss$'],
            ],
          },
        ],
      },
    },
  ],
}
