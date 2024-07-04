import '@logseq/libs'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { v4 as uuidv4 } from 'uuid'

import { mixedWordsFunction } from './services/countWords'
import getCount from './services/getCount'
import renderCount from './services/renderCount'
import { settings } from './services/settings'
import { provideStyles } from './styles'

const main = async () => {
  console.log('Wordcount plugin loaded')

  provideStyles()

  logseq.Editor.registerSlashCommand('Word count', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcount_${uuidv4()}}}`,
    )
  })

  logseq.Editor.registerSlashCommand('Writing session target', async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcount_, 500}}`)
  })

  logseq.Editor.registerSlashCommand('Character count', async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcountchar_}}`)
  })

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const uuid = payload.uuid
    const [type, target] = payload.arguments

    if (!type) return

    if (!type.startsWith(':wordcountchar_') && !type.startsWith(':wordcount_'))
      return

    const wordcountId = `wordcount_${type.split('_')[1]?.trim()}_${slot}`

    const headerBlock = await logseq.Editor.getBlock(uuid, {
      includeChildren: true,
    })

    if (type.startsWith(':wordcount_')) {
      const totalCount = getCount(
        headerBlock!.children as BlockEntity[],
        'words',
      )
      renderCount(slot, wordcountId, type, target, totalCount)
    } else if (type.startsWith(':wordcountchar_')) {
      const totalCount = getCount(
        headerBlock!.children as BlockEntity[],
        'chars',
      )
      renderCount(slot, wordcountId, type, target, totalCount)
    } else {
      logseq.UI.showMsg(
        'Please do not change the render parameters except for your writing target.',
        'error',
      )
    }
  })

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type, count] = payload.arguments
    if (!type.startsWith(':wordcount-page_')) return
    const wordcountId = `wordcount-page_${type.split('_')[1]?.trim()}_${slot}`

    logseq.provideUI({
      key: wordcountId,
      slot,
      reset: true,
      template: `
          <span class="wordcount-btn" data-slot-id="${wordcountId}" data-wordcount-id="${wordcountId}">Wordcount: ${count}</span>`,
    })
  })

  logseq.Editor.registerSlashCommand('Word count - page', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcount-page_, 0}}`,
    )
  })

  let count = 0
  logseq.DB.onChanged(async function ({ blocks }) {
    if (blocks.length === 1) {
      const content = blocks[0].content
      count = mixedWordsFunction(content)
      const blk = await logseq.Editor.getCurrentBlock()
      if (blk) {
        const page = await logseq.Editor.getPage(blk.page.id)
        const pbt = await logseq.Editor.getPageBlocksTree(page!.name)
        if (pbt[0].content.includes('{{renderer :wordcount-page_,')) {
          let content = pbt[0].content
          const regexp = /\{\{renderer :wordcount-page_,(.*?)\}\}/
          const matched = regexp.exec(content)
          content = content.replace(
            matched![0],
            `{{renderer :wordcount-page_, ${count}}}`,
          )

          await logseq.Editor.updateBlock(pbt[0].uuid, content)
        }
      }
    }

    if (logseq.settings!.toolbar) {
      logseq.App.registerUIItem('toolbar', {
        key: 'wordcount-page',
        template: `<p class="wordcount-toolbar">${count} words</p>`,
      })
    }
  })
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
