import { onDbChange } from '../../utils/db-change-bus'
import { getCount } from '../../utils/get-count'

const renderToolbarUI = (count: number) => {
  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-wordcount-plugin',
    template: `<a class="button wordcount-toolbar">${count} words</a>`,
  })
}

export const handleToolbar = () => {
  renderToolbarUI(0)

  let currentName: string | undefined
  let currentPageId: number | undefined

  const refresh = async () => {
    if (!currentName) return
    const pbt = await logseq.Editor.getPageBlocksTree(currentName)
    if (!pbt) return
    renderToolbarUI(getCount(pbt, 'words'))
  }

  logseq.App.onRouteChanged(
    async ({
      parameters: {
        path: { name },
      },
    }) => {
      currentName = name
      currentPageId = undefined
      if (!name) return

      await refresh()

      const page = await logseq.Editor.getPage(name)
      currentPageId = page?.id
    },
  )

  onDbChange((changedPageIds) => {
    if (currentPageId != null && changedPageIds.has(currentPageId)) {
      return refresh()
    }
  })
}
