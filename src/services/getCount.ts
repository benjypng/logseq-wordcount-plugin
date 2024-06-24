import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { mixedWordsFunction, simpleWordsFunction } from "./countWords";
import { removeFormat } from "./format";

export default function getCount(
  childrenArr: BlockEntity[],
  countWhat: string
) {
  let totalCount = 0;
  if (countWhat === "words") {
    function recurse(childrenArr: BlockEntity[]) {
      for (let a = 0; a < childrenArr.length; a++) {
        const content = removeFormat(childrenArr[a].content);
        if (logseq.settings!.forceWordCount) {
          totalCount += simpleWordsFunction(content);
        } else {
          totalCount += mixedWordsFunction(content);
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
        totalCount += removeFormat(childrenArr[a].content).length;

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
