import '@logseq/libs'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import buttonCss from './index.css?raw'
import getCount from './services/getCount'
import renderCount from './services/renderCount'
import { settings } from './services/settings'

const main = async () => {
  console.log('logseq-wordcount-plugin loaded')

  logseq.provideStyle(buttonCss)

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
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
