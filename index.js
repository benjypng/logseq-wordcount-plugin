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

  // Generate unique identifier
  const uniqueIdentifier = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '');

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand('wordcount', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcount_${uniqueIdentifier()}}}`
    );
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

    // Generate unique identifier for macro renderer so that more than one word counter can be implemented in the same page
    const id = type.split('_')[1]?.trim();
    const wordcountId = `wordcount_${id}`;

    // Find word counter block so as to track children under it
    const pageBlocksTree = await logseq.Editor.getCurrentPageBlocksTree();
    const findRendererObj = pageBlocksTree.find(
      (o) => o.content === `{{renderer :${wordcountId}}}`
    );
    const getParentBlock = await logseq.Editor.getBlock(findRendererObj.uuid, {
      includeChildren: true,
    });

    // Function to retrieve number of words
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

    if (!type.startsWith(':wordcount_')) return;
    logseq.provideUI({
      key: `${wordcountId}`,
      slot,
      reset: true,
      template: `
      <button class="wordcount-btn" data-slot-id="${slot}" data-wordcount-id="${wordcountId}">Word count: ${totalWords}</button>
     `,
    });
  });
};

logseq.ready(main).catch(console.error);
