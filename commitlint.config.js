module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],
    // 'subject-case': [2, 'never', ['upper-case']],
    // 'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [0] // Disable body line length checking
  },
  ignores: [
    // Ignore commits that start with "Initial implementation" (legacy commit)
    (message) => message.startsWith('Initial implementation'),
    // Ignore merge commits
    (message) => message.startsWith('Merge '),
    // Ignore semantic-release commits
    (message) => message.startsWith('chore(release):'),
  ]
};