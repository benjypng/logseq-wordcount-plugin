import { CountResult } from "./getCount.ts";

export default function renderCount(
  slot: string,
  id: string,
  { count, options }: CountResult
) {
  function button() {
    const {
      wordCountStr,
      characterCountStr,
      wordTargetStr,
      characterTargetStr,
    } = logseq.settings!;

    if (!options.target) {
      switch (options.countingType) {
        case "words":
          return `${wordCountStr} ${count}`;
        case "characters":
          return `${characterCountStr} ${count}`;
      }
    } else {
      const percentage = ((count / options.target) * 100).toFixed(1);
      switch (options.countingType) {
        case "words":
          return `${wordTargetStr} ${percentage}% (${count}/${options.target})`;
        case "characters":
          return `${characterTargetStr} ${percentage}% (${count}/${options.target})`;
      }
    }
  }

  logseq.provideUI({
    key: id,
    slot,
    reset: true,
    template: `
          <span class="wordcount-btn" data-slot-id="${id}" data-wordcount-id="${id}">${button()}</span>`,
  });
}
