export const characterCount = () => {
  logseq.Editor.registerSlashCommand('Character count', async (e) => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcountchar_${e.uuid}}}`,
    )
  })
}
