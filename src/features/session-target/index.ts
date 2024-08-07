export const sessionTarget = () => {
  logseq.Editor.registerSlashCommand('Writing session target', async (e) => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcount_${e.uuid}, 500}}`,
    )
  })
}
