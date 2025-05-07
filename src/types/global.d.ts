declare global {
  interface Window {
    _iconfont_svg_string_4914270: string
    __iconfont__svg__cssinject__?: boolean
    __globalVolume: number
  }

  interface NotificationOptions {
    body?: string
    icon?: string
    badge?: string
    tag?: string
    silent?: boolean
    requireInteraction?: boolean
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, unknown>
  export default component
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.json' {
  const content: Record<string, unknown>
  export default content
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_API_BASE_URL: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
