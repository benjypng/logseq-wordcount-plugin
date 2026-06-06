import '@logseq/libs'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { characterCount } from './features/character-count'
import { countHighlighted } from './features/count-highlighted'
import { sessionTarget } from './features/session-target'
import { handleToolbar } from './features/toolbar'
import { wordCount } from './features/word-count'
import css from './index.css?raw'
import { settings } from './settings'
import { RendererEntry } from './types'
import { getCount } from './utils/get-count'
import { handlePopup } from './utils/handle-popup'
import { renderButton } from './utils/render-button'

const main = async () => {
  logseq.UI.showMsg('logseq-wordcount-plugin loaded')

  logseq.provideStyle(css)
  handlePopup()

  const activeRenderers = new Map<string, RendererEntry>()

  const renderWordcount = async (entry: RendererEntry) => {
    const { slot, type, target, uuid } = entry
    const wordcountId = `wordcount_${uuid}_${slot}`
    const headerBlock = await logseq.Editor.getBlock(uuid, {
      includeChildren: true,
    })
    if (!headerBlock) {
      activeRenderers.delete(uuid)
      return
    }
    entry.pageId = headerBlock.page?.id

    if (type.startsWith(`:wordcount_`)) {
      const totalCount = getCount(
        headerBlock.children as BlockEntity[],
        'words',
      )
      renderButton(slot, wordcountId, type, totalCount, target)
    } else if (type.startsWith(`:wordcountchar_`)) {
      const totalCount = getCount(
        headerBlock.children as BlockEntity[],
        'chars',
      )
      renderButton(slot, wordcountId, type, totalCount, target)
    }
  }

  logseq.App.onMacroRendererSlotted(
    async ({ slot, payload: { uuid, arguments: args } }) => {
      const [type, target] = args

      if (
        !type ||
        (!type.startsWith(':wordcountchar_') &&
          !type.startsWith(':wordcount_') &&
          !type.startsWith(':wordcountpomodoro_'))
      )
        return

      const entry: RendererEntry = { slot, type, target, uuid }
      activeRenderers.set(uuid, entry)
      await renderWordcount(entry)
    },
  )

  let rerenderTimer: ReturnType<typeof setTimeout> | undefined // debounce
  const pendingUuids = new Set<string>()
  const offDbChanged = logseq.DB.onChanged(({ blocks }) => {
    if (activeRenderers.size === 0) return

    const changedPageIds = new Set(
      blocks.map((b) => b.page?.id).filter((id): id is number => id != null),
    )
    if (changedPageIds.size === 0) return

    let queued = false
    for (const entry of activeRenderers.values()) {
      if (entry.pageId != null && changedPageIds.has(entry.pageId)) {
        pendingUuids.add(entry.uuid)
        queued = true
      }
    }
    if (!queued) return

    if (rerenderTimer) clearTimeout(rerenderTimer)
    rerenderTimer = setTimeout(() => {
      const entries = [...pendingUuids]
        .map((u) => activeRenderers.get(u))
        .filter((e): e is RendererEntry => e != null)
      pendingUuids.clear()
      void Promise.all(entries.map((entry) => renderWordcount(entry)))
    }, 300)
  })
  logseq.beforeunload(async () => {
    if (rerenderTimer) clearTimeout(rerenderTimer)
    offDbChanged()
  })

  // Features
  wordCount()
  characterCount()
  sessionTarget()

  if (logseq.settings!.toolbar) handleToolbar()
  if (logseq.settings!.countSelected) countHighlighted()
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
