export const mixedWordsFunction = (str: string): number => {
  if (!str || str.length === 0) return 0
  str = str.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  str = str.replace(/[\u007F-\u00FE.,/#!$%^&*;:{}=_`~()>\\]/g, ' ')
  const matches = str.match(/[\u00ff-\uffff]|[a-z0-9]+/gi)
  return matches ? matches.length : 0
}

// To force counting of Cyrillic characters as words, e.g. for Russian
export const simpleWordsFunction = (str: string): number => {
  if (!str || str.length === 0) return 0
  str = str.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  str = str.replace(/[^а-яА-ЯёЁ\s]/g, ' ')
  const matches = str.match(/[а-яА-ЯёЁ]+/g)
  return matches ? matches.length : 0
}
