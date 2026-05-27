/**
 * 构建资源 URL，自动加上 Vite base 前缀。
 * 确保 GitHub Pages (/suzinao-portfolio/) 和 Vercel (/) 下图片都能正确加载。
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const cleanPath = path.replace(/^\//, '');
  return `${base}${cleanPath}`;
}
