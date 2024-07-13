import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { mixedWordsFunction, simpleWordsFunction } from './countWords'

export default function getCount(
  childrenArr: BlockEntity[],
  countWhat: string,
) {
  let totalCount = 0
  if (countWhat === 'words') {
    function recurse(childrenArr: BlockEntity[]) {
      for (const child of childrenArr) {
        if (logseq.settings!.forceWordCount) {
          totalCount += simpleWordsFunction(child.content)
        } else {
          totalCount += mixedWordsFunction(child.content)
        }
        if (child.children) {
          recurse(child.children as BlockEntity[])
        }
      }
    }
    recurse(childrenArr)
    return totalCount
  } else if (countWhat === 'chars') {
    function recurse(childrenArr: BlockEntity[]) {
      for (const child of childrenArr) {
        totalCount += child.content.length
        if (child.children) {
          recurse(child.children as BlockEntity[])
        }
      }
    }
    recurse(childrenArr)
    return totalCount
  } else {
    return 0
  }
}
