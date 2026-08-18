import { defineConfig } from 'vite'

// GitHub Pages 项目站点的 URL 是 https://thebaby9.github.io/thing/,
// 静态资源必须以 /thing/ 为基路径生成引用。
export default defineConfig({
  base: '/thing/',
})
