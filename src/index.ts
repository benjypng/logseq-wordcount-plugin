import '@logseq/libs'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { characterCount } from './features/character-count'
import { countHighlighted } from './features/count-highlighted'
import { sessionTarget } from './features/session-target'
import { handleToolbar } from './features/toolbar'
import { wordCount } from './features/word-count'
import css from './index.css?raw'
import { settings } from './settings'
import { getCount } from './utils/get-count'
import { handlePopup } from './utils/handle-popup'
import { renderButton } from './utils/render-button'

const main = async () => {
  logseq.UI.showMsg('logseq-wordcount-plugin loaded')

  logseq.provideStyle(css)
  handlePopup()

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

      const wordcountId = `wordcount_${uuid}_${slot}`
      const headerBlock = await logseq.Editor.getBlock(uuid, {
        includeChildren: true,
      })
      if (!headerBlock) return

      switch (true) {
        case type.startsWith(`:wordcount_`): {
          const totalCount = getCount(
            headerBlock.children as BlockEntity[],
            'words',
          )
          renderButton(slot, wordcountId, type, totalCount, target)
          break
        }
        case type.startsWith(`:wordcountchar_`): {
          const totalCount = getCount(
            headerBlock.children as BlockEntity[],
            'chars',
          )
          renderButton(slot, wordcountId, type, totalCount, target)
          break
        }
        default:
          return
      }
    },
  )

  // Features
  wordCount()
  characterCount()
  sessionTarget()

  if (logseq.settings!.toolbar) handleToolbar()
  if (logseq.settings!.countSelected) countHighlighted()
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
