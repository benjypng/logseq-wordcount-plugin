import '@logseq/libs';

const main = async () => {
  console.log('Wordcount plugin loaded');
  logseq.provideStyle(`
    .wordcount-btn {
       border: 1px solid var(--ls-border-color); 
       white-space: initial; 
       padding: 2px 4px; 
       border-radius: 4px; 
       user-select: none;
       cursor: default;
       display: flex;
       align-content: center;
    }
    `);

  let wordCountBlock;

  logseq.Editor.registerSlashCommand('wordcount', async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcount}} `);
    wordCountBlock = await logseq.Editor.getCurrentBlock();
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type] = payload.arguments;
    const getParentBlock = await logseq.Editor.getBlock(wordCountBlock.uuid, {
      includeChildren: true,
    });

    const wordCountFunction = (str) => {
      return str.split(' ').filter(function (n) {
        return n != '';
      }).length;
    };

    const returnNumberOfWords = () => {
      let numberOfChildBlocks = getParentBlock.children.length;
      let totalWords = 0;

      for (let i = 0; i < numberOfChildBlocks; i++) {
        totalWords += wordCountFunction(getParentBlock.children[i].content);
      }

      return totalWords;
    };

    const totalWords = returnNumberOfWords();

    if (type !== ':wordcount') return;
    logseq.provideUI({
      key: 'logseq wordcount plugin',
      slot,
      reset: true,
      template: `
      <button class="wordcount-btn">Word count: ${totalWords}</button>
     `,
    });
  });
};

logseq.ready(main).catch(console.error);
