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
import { onDbChange } from './utils/db-change-bus'
import { getCount } from './utils/get-count'
import { handlePopup } from './utils/handle-popup'
import { isSlotMounted } from './utils/is-slot-mounted'
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

    // Slot was torn down (block scrolled off / page changed). Skip rather than
    // render into a dead slot; onMacroRendererSlotted re-renders with a fresh
    // slot when the block remounts.
    if (!isSlotMounted(slot)) return

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

  // Re-render counters whose page was touched in the change burst. onDbChange
  // handles the single shared subscription and debounce; we just filter the
  // active renderers to the affected pages.
  onDbChange((changedPageIds) => {
    const entries = [...activeRenderers.values()].filter(
      (entry) => entry.pageId != null && changedPageIds.has(entry.pageId),
    )
    return Promise.all(entries.map((entry) => renderWordcount(entry)))
  })

  // Features
  wordCount()
  characterCount()
  sessionTarget()

  if (logseq.settings!.toolbar) handleToolbar()
  if (logseq.settings!.countSelected) countHighlighted()
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
