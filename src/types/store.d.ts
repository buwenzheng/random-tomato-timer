import { Store } from 'pinia'
import type { DefineStoreOptions } from 'pinia'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?:
      | boolean
      | {
          enabled: boolean
          strategies?: {
            key?: string
            storage?: Storage
            paths?: string[]
          }[]
        }
  }
}

export interface UserState {
  id: string
  username: string
  email: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

export interface AppState {
  sidebar: {
    opened: boolean
    withoutAnimation: boolean
  }
  device: 'desktop' | 'mobile'
  size: 'default' | 'small' | 'large'
  theme: 'light' | 'dark'
}

export type StoreDefinition = DefineStoreOptions<string, object, object, object>
