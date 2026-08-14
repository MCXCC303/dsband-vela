// ESLint 8 配置（Vela 快应用项目）
// 说明：
// - .ux 文件的语法校验由 `aiot build`（编译器）完成，eslint 只负责 src 下的 .js 文件
// - console / setTimeout 等由 Vela 快应用运行时提供，此处声明为全局变量
module.exports = {
  root: true,
  env: {
    es2021: true
  },
  globals: {
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  extends: ['eslint:recommended'],
  ignorePatterns: [
    'node_modules/**',
    'build/**',
    'dist/**',
    'sign/**',
    'coverage/**',
    '.nyc_output/**'
  ]
}
