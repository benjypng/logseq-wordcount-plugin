export default function renderCount(
  slot: string,
  id: string,
  type: string,
  target: string | undefined,
  totalCount: number
) {
  function button() {
    const {
        wordCountStr,
        characterCountStr,
        wordTargetStr,
        characterTargetStr
     } = logseq.settings!;

    if (target === undefined) {
      if (type.startsWith(":wordcount_")) {
        return `${wordCountStr} ${totalCount}`;
      } else if (type.startsWith(":wordcountchar_")) {
        return `${characterCountStr} ${totalCount}`;
      } else if (type.startsWith(":wordcount-page_")) {
        return `${wordCountStr} ${!totalCount ? 0 : totalCount}`;
      }
    } else {
      const percentage = ((totalCount / parseInt(target)) * 100).toFixed(1);

      if (type.startsWith(":wordcount_")) {
        return `${wordTargetStr} ${percentage}% (${totalCount}/${target})`;
      } else if (type.startsWith(":wordcountchar_")) {
        return `${characterTargetStr} ${percentage}% (${totalCount}/${target})`;
      }
    }
  }

  logseq.provideUI({
    key: id,
    slot,
    reset: true,
    template: `
          <button class="wordcount-btn" data-slot-id="${id}" data-wordcount-id="${id}">${button()}</button>`,
  });
}
