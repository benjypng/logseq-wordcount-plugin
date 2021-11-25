import '@logseq/libs';

const main = async () => {
  console.log('Wordcount plugin loaded');

  // Style for word counter
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

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand('wordcount', async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcount}}`);
  });

  // Word count function
  const wordCountFunction = (str) => {
    return str.split(' ').filter(function (n) {
      return n != '';
    }).length;
  };

  // Insert renderer
  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type] = payload.arguments;

    const pageBlocksTree = await logseq.Editor.getCurrentPageBlocksTree();
    const findRendererObj = pageBlocksTree.find(
      (o) => o.content === '{{renderer :wordcount}}'
    );
    const getParentBlock = await logseq.Editor.getBlock(findRendererObj.uuid, {
      includeChildren: true,
    });
    console.log(getParentBlock);

    const returnNumberOfWords = async () => {
      let totalWords = 0;

      // Begin recursion
      const getCount = async (childrenArr) => {
        for (let a = 0; a < childrenArr.length; a++) {
          totalWords += wordCountFunction(childrenArr[a].content);

          if (childrenArr[a].children) {
            getCount(childrenArr[a].children);
          } else {
            return totalWords;
          }
        }
      };

      await getCount(getParentBlock.children);
      return totalWords;
    };

    const totalWords = await returnNumberOfWords();

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
