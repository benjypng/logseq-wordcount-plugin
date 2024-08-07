import { getCount } from '../../utils/get-count'

const renderToolbarUI = (count: number) => {
  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-wordcount-plugin',
    template: `<a class="button wordcount-toolbar">${count} words</a>`,
  })
}

export const handleToolbar = () => {
  let count = 0
  renderToolbarUI(count)

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
      renderToolbarUI(count)

      const page = await logseq.Editor.getPage(name)
      if (!page) return
      logseq.DB.onBlockChanged(page.uuid, async () => {
        const pbt = await logseq.Editor.getPageBlocksTree(name)
        if (!pbt) return
        count = getCount(pbt, 'words')
        renderToolbarUI(count)
      })
    },
  )
}
