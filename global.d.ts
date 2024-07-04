// global.d.ts
import '@logseq/libs'

declare module '@logseq/libs' {
  interface LSPluginBaseInfo {
    settings: {
      disabled: boolean
      custom: string
      [key: string]: any
    }
  }
}

declare global {
  namespace logseq {
    const settings: LSPluginBaseInfo['settings']
  }
}

export {}
