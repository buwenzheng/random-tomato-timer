/**
 * 预加载图片
 * @param src 图片地址
 * @returns Promise<HTMLImageElement>
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 批量预加载图片
 * @param srcs 图片地址数组
 * @returns Promise<HTMLImageElement[]>
 */
export const preloadImages = (srcs: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(srcs.map(src => preloadImage(src)))
}

/**
 * 获取图片的 WebP 版本
 * @param src 原始图片地址
 * @returns string
 */
export const getWebPImage = (src: string): string => {
  if (src.endsWith('.webp')) return src
  return src.replace(/\.(jpg|jpeg|png)$/, '.webp')
}

/**
 * 检查浏览器是否支持 WebP
 * @returns Promise<boolean>
 */
export const checkWebPSupport = (): Promise<boolean> => {
  return new Promise(resolve => {
    const webP = new Image()
    webP.onload = () => resolve(webP.width > 0 && webP.height > 0)
    webP.onerror = () => resolve(false)
    webP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
  })
}
