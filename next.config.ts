import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 临时禁用图片优化来排查问题
    unoptimized: true,
    // 如果使用远程图片，添加域名
    remotePatterns: [],
  },
  // 确保 TypeScript 错误不会阻止构建（仅开发时）
  typescript: {
    // ⚠️ 生产环境请移除此项
    ignoreBuildErrors: false,
  },
}

export default nextConfig