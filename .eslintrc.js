module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  settings: {
    'import/extensions': ['.ts'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.ts'],
      },
    },
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      { 'js': 'never', 'jsx': 'never', 'ts': 'never', 'tsx': 'never' }
    ],
    'import/no-extraneous-dependencies': ['error', { 'devDependencies': ['**/*.*spec.ts', '**/*.mock.ts', '**/specs/*' ] }],
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'import/order': [
      'error',
      {
        'groups': [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        'pathGroups': [
          {
            'pattern': 'src/libs/**',
            'group': 'external',
            'position': 'after',
          },
          {
            'pattern': 'src/util/**',
            'group': 'external',
            'position': 'after',
          },
          {
            'pattern': 'src/infrastructure/**',
            'group': 'internal',
            'position': 'before',
          },
          {
            'pattern': 'src/application/**',
            'group': 'internal',
          },
          {
            'pattern': 'src/domain/**',
            'group': 'internal',
            'position': 'after',
          }
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        },
      },
    ],
    'max-len': ['error', { 'code': 150 }],
    'no-case-declarations': 'off',
    'max-classes-per-file': 'off',
    'no-underscore-dangle': 'off',
    'no-shadow': 'off',
    'consistent-return': 'off',
    'no-useless-constructor': 'off',
    'lines-between-class-members': 'off',
    'no-use-before-define': 'off',
    'class-methods-use-this': 'off',
    'default-case': 'off',
    'operator-linebreak': 'off',
  },
};
