import 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    layout?: string
  }
}

export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'meta'> {
  name: string
  meta: {
    title: string
    icon?: string
    hidden?: boolean
    roles?: string[]
  }
  children?: AppRouteRecordRaw[]
}

export type AppRouteModule = AppRouteRecordRaw
