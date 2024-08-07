import { createWordcountText } from '../services/create-wordcharcount-text'

export const renderButton = (
  slot: string,
  id: string,
  type: string,
  totalCount: number,
  target: string | undefined, // session target
) => {
  // Normal button
  // target: has session target
  // !target: has no session target and displays normal text
  logseq.provideUI({
    key: id,
    slot,
    reset: true,
    template: `<span id="${id}" class="wordcount-btn">${createWordcountText(totalCount, target, type)}</span>`,
  })
}
