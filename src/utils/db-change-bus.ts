import { DbChangeHandler } from '../types'

const handlers = new Set<DbChangeHandler>()

let initialized = false
let timer: ReturnType<typeof setTimeout> | undefined
let pendingPageIds = new Set<number>()

const init = () => {
  initialized = true

  const off = logseq.DB.onChanged(({ blocks }) => {
    if (handlers.size === 0) return

    for (const b of blocks) {
      const id = b.page?.id
      if (id != null) pendingPageIds.add(id)
    }
    if (pendingPageIds.size === 0) return

    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      const changedPageIds = pendingPageIds
      pendingPageIds = new Set()
      for (const handler of handlers) {
        void Promise.resolve(handler(changedPageIds)).catch(console.error)
      }
    }, 300)
  })

  logseq.beforeunload(async () => {
    if (timer) clearTimeout(timer)
    off()
  })
}

export const onDbChange = (handler: DbChangeHandler): (() => void) => {
  if (!initialized) init()
  handlers.add(handler)
  return () => handlers.delete(handler)
}
