import { mixedWordsFunction } from '../../services/countWords'

export const countHighlighted = () => {
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
