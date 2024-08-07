export const wordCount = () => {
  logseq.Editor.registerSlashCommand('Word count', async (e) => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcount_${e.uuid}}}`,
    )
  })
}
