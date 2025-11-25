export const createWordcountText = (
  totalCount: number,
  target: string | undefined,
  type: string,
) => {
  const { wordCountStr, characterCountStr, wordTargetStr, characterTargetStr } =
    logseq.settings!

  let text
  if (!target) {
    // Normal text
    switch (true) {
      case type.startsWith(':wordcount_'):
        text = `${wordCountStr} ${totalCount}`
        break
      case type.startsWith(':wordcountchar_'):
        text = `${characterCountStr} ${totalCount}`
        break
      default:
        text = '0'
    }
  } else {
    // Session text
    const sessionTarget = parseInt(target)
    const percentage = Math.floor((totalCount / sessionTarget) * 100)

    switch (true) {
      case type.startsWith(':wordcount_'):
        text = `${wordTargetStr} ${percentage}% (${totalCount}/${target})`
        break
      case type.startsWith('wordcountchar_'):
        text = `${characterTargetStr} ${percentage}% (${totalCount}/${target})`
        break
      default:
        text = `${wordTargetStr} 0% (${totalCount}/${target})`
    }
  }
  return text
}
