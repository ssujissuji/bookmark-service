module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020, // 최신 문법 지원
    sourceType: 'module', // import/export 사용 가능
    ecmaFeatures: { jsx: true }, // JSX 지원
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: true, // tsconfig 경로 alias 인식
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  env: {
    browser: true, // React 코드용
    es2021: true,
  },
  plugins: ['react', '@typescript-eslint', 'import', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    // ✨ import 관련
    'import/no-unresolved': 'off', // Vite alias(@) 때문에 끔
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          'vite.config.ts',
          '**/*.config.ts',
          '**/*.config.js',
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/vite-env.d.ts',
          '**/*.spec.ts',
        ],
      },
    ],

    // ✨ React / TS 기본
    'react/react-in-jsx-scope': 'off', // React 17+ 에선 필요없음
    'react/prop-types': 'off', // TS 쓰면 prop-types 불필요
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-explicit-any': 'off',

    // ✨ 스타일 관련
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'off',
  },

  // ✨ Node 환경용 vite.config.ts 등 override
  overrides: [
    {
      files: ['vite.config.ts', 'tsconfig.node.json', 'server/**/*.ts'],
      env: { node: true },
      rules: {
        'import/no-extraneous-dependencies': 'off', // ✅ devDependencies 경고 끔
      },
    },
  ],
};
