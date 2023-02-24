import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { mixedWordsFunction, simpleWordsFunction } from "./countWords";

export default function getCount(
  childrenArr: BlockEntity[],
  countWhat: string
) {
  let totalCount = 0;
  if (countWhat === "words") {
    function recurse(childrenArr: BlockEntity[]) {
      for (let a = 0; a < childrenArr.length; a++) {
        if (logseq.settings!.forceWordCount) {
          totalCount += simpleWordsFunction(childrenArr[a].content);
        } else {
          totalCount += mixedWordsFunction(childrenArr[a].content);
        }
        if (childrenArr[a].children) {
          recurse(childrenArr[a].children as BlockEntity[]);
        }
      }
    }

    recurse(childrenArr);
    return totalCount;
  } else if (countWhat === "chars") {
    function recurse(childrenArr: BlockEntity[]) {
      for (let a = 0; a < childrenArr.length; a++) {
        totalCount += childrenArr[a].content.length;

        if (childrenArr[a].children) {
          recurse(childrenArr[a].children as BlockEntity[]);
        }
      }
    }
    recurse(childrenArr);
    return totalCount;
  } else {
    return 0;
  }
}
