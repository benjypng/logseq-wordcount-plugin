import '@logseq/libs'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { characterCount } from './features/character-count'
import { countHighlighted } from './features/count-highlighted'
import { sessionTarget } from './features/session-target'
import { handleToolbar } from './features/toolbar'
import { wordCount } from './features/word-count'
import css from './index.css?raw'
import getCount from './services/getCount'
import renderCount from './services/renderCount'
import { settings } from './services/settings'
import { handlePopup } from './utils/handle-popup'

const main = async () => {
  console.log('logseq-wordcount-plugin loaded')

  logseq.provideStyle(css)
  handlePopup()

  logseq.App.onMacroRendererSlotted(
    async ({ slot, payload: { uuid, arguments: args } }) => {
      const [type, target] = args
      if (
        !type ||
        (!type.startsWith(':wordcountchar_') && !type.startsWith(':wordcount_'))
      )
        return

      const wordcountId = `wordcount_${uuid}_${slot}`
      const headerBlock = await logseq.Editor.getBlock(uuid, {
        includeChildren: true,
      })
      if (!headerBlock) return

      if (type.startsWith(':wordcount_')) {
        const totalCount = getCount(
          headerBlock.children as BlockEntity[],
          'words',
        )
        renderCount(slot, wordcountId, type, target, totalCount)
      } else if (type.startsWith(':wordcountchar_')) {
        const totalCount = getCount(
          headerBlock.children as BlockEntity[],
          'chars',
        )
        renderCount(slot, wordcountId, type, target, totalCount)
      }
    },
  )

  wordCount()
  characterCount()
  sessionTarget()

  if (logseq.settings!.toolbar) {
    handleToolbar()
  }
  if (logseq.settings!.countSelected) {
    countHighlighted()
  }
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
