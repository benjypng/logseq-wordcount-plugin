import '@logseq/libs'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import css from './index.css?raw'
import { mixedWordsFunction } from './services/countWords'
import getCount from './services/getCount'
import renderCount from './services/renderCount'
import { settings } from './services/settings'
import { handlePopup } from './utils/handle-popup'

const main = async () => {
  console.log('logseq-wordcount-plugin loaded')

  logseq.provideStyle(css)
  handlePopup()

  logseq.Editor.registerSlashCommand('Word count', async (e) => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcount_${e.uuid}}}`,
    )
  })
  logseq.Editor.registerSlashCommand('Character count', async (e) => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcountchar_${e.uuid}}}`,
    )
  })
  logseq.Editor.registerSlashCommand('Writing session target', async (e) => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcount_${e.uuid}, 500}}`,
    )
  })

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

  if (logseq.settings!.toolbar) {
    let count = 0
    logseq.App.registerUIItem('toolbar', {
      key: 'logseq-wordcount-plugin',
      template: `<a class="button wordcount-toolbar">${count} words</a>`,
    })

    logseq.App.onRouteChanged(
      async ({
        parameters: {
          path: { name },
        },
      }) => {
        if (!name) return

        const pbt = await logseq.Editor.getPageBlocksTree(name)
        if (!pbt) return
        count = getCount(pbt, 'words')
        logseq.App.registerUIItem('toolbar', {
          key: 'logseq-wordcount-plugin',
          template: `<a class="button wordcount-toolbar">${count} words</a>`,
        })

        const page = await logseq.Editor.getPage(name)
        if (!page) return
        logseq.DB.onBlockChanged(page.uuid, async () => {
          const pbt = await logseq.Editor.getPageBlocksTree(name)
          if (!pbt) return
          count = getCount(pbt, 'words')
          logseq.App.registerUIItem('toolbar', {
            key: 'logseq-wordcount-plugin',
            template: `<a class="button wordcount-toolbar">${count} words</a>`,
          })
        })
      },
    )
  }

  if (logseq.settings!.countSelected) {
    logseq.Editor.onInputSelectionEnd(({ text, point: { x, y } }) => {
      const count = mixedWordsFunction(text)
      logseq.provideUI({
        key: `logseq-wordcount-plugin-countselection`,
        template: `<div style="padding: 10px; overflow: auto;">Words: ${count}</div>`,
        style: {
          left: x + 'px',
          top: y + 'px',
          width: '150px',
          backgroundColor: 'var(--ls-primary-background-color)',
          color: 'var(--ls-primary-text-color)',
          boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
        },
      })
      logseq.showMainUI()
    })
  }
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
