/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  // Provide Vue SFC component typing to TypeScript tooling
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.css'
declare module '*.svg'
