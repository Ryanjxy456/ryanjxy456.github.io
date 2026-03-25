import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeSlug from 'rehype-slug';
import sitemap from '@astrojs/sitemap';
import svelte from "@astrojs/svelte";
import react from '@astrojs/react';
import tailwindcss from "@tailwindcss/vite";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import vercel from '@astrojs/vercel'; // 确认已引入

// https://astro.build/config
export default defineConfig({
  site: 'https://ryanjxy456.github.io',
  base: '/',
  // 修改点 1：将 static 改为 hybrid，支持 API 动态运行
  output: 'hybrid', 
  // 修改点 2：添加 vercel 适配器
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  
  integrations: [mdx(), sitemap(), svelte(), react()],
  
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeSlug],
    remarkRehype: {
      footnoteLabel: "脚注",
      footnoteBackLabel: '文档内容的脚注',
      allowDangerousHtml: true,
    },
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
      langs: [], 
    },
    syntaxHighlight: 'shiki',
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['zod', '@ai-sdk/react']
    }
  },
  devToolbar: {
    enabled: false
  }
});