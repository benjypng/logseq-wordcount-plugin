import { BlockEntity } from "@logseq/libs/dist/LSPlugin";
import { Options, parseQuery } from "./query.ts";
import { mixedWordsFunction, simpleWordsFunction } from "./countWords";
import { removeFormat } from "./format.ts";

export interface CountResult { count: number; options: Options; }

export default function getCount(
  childrenArr: BlockEntity[],
  query: string = "",
): CountResult {
  const options = parseQuery(query);

  let totalCount = 0;

  function recurse(childrenArr: BlockEntity[]) {
    for (const child of childrenArr) {
      if (options.filters.every(filter => filter(child))) {
        const content = removeFormat(child.content)
        if (options.countingType == "words") {
          if (logseq.settings!.forceWordCount) {
            totalCount += simpleWordsFunction(content);
          } else {
            totalCount += mixedWordsFunction(content);
          }
        } else {
          totalCount += content.length;
        }
      }
      if (child.children) {
        recurse(child.children as BlockEntity[]);
      }
    }
  }
  recurse(childrenArr);
  return { count: totalCount, options };
}
