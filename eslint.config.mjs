import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    markdown: false,
    yaml: false,
    toml: false,
    ignores: [
      '.nuxt/**',
      '.output/**',
      'node_modules/**',
      'coverage/**',
      'content/**',
      'memory/**',
      'public/**',
      'project.md',
      'README.md',
      'pnpm-lock.yaml',
    ],
    rules: {
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
      'ts/no-explicit-any': 'error',
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
    },
  },
)
