module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'plugin:vue/recommended',
        '@vue/airbnb',
        '@vue/typescript',
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'import/prefer-default-export': false,
        'vue/singleline-html-element-content-newline': ['error', { ignoreWhenNoAttributes: false }],
        'vue/html-closing-bracket-newline': ['error', {
            singleline: 'never',
            multiline: 'never',
        }],
        indent: ['error', 4],
    },
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
};
