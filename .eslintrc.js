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
        'class-methods-use-this': 'off',
        'no-underscore-dangle': ['error', { allowAfterThis: true }],
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
        'import/prefer-default-export': 0,
        'vue/singleline-html-element-content-newline': ['error', { ignoreWhenNoAttributes: false }],
        'no-param-reassign': ['error', { props: false }],
        'vue/html-closing-bracket-newline': ['error', {
            singleline: 'never',
            multiline: 'never',
        }],
        'max-len': ['error', { code: 120 }],
        'vue/html-indent': ['error', 2],
        indent: ['error', 2],
        'vue/html-closing-bracket-newline': ['error', {
          singleline: 'never',
          multiline: 'never',
        }],
    },
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
};
