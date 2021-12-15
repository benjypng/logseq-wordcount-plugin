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

  // Credit to https://stackoverflow.com/users/11854986/ken-lee for the below function
  const mixedWordsFunction = (str) => {
    /// fix problem in special characters such as middle-dot, etc.
    str = str.replace(/[\u007F-\u00FE.,\/#!$%\^&\*;:{}=\-_`~()>\\]/g, ' ');

    /// make a duplicate first...
    let str1 = str;
    let str2 = str;

    /// the following remove all chinese characters and then count the number of english characters in the string
    str1 = str1.replace(/[^!-~\d\s]+/gi, ' ');

    /// the following remove all english characters and then count the number of chinese characters in the string
    str2 = str2.replace(/[!-~\d\s]+/gi, '');

    const matches1 = str1.match(/[\u00ff-\uffff]|\S+/g);
    const matches2 = str2.match(/[\u00ff-\uffff]|\S+/g);

    const count1 = matches1 ? matches1.length : 0;
    const count2 = matches2 ? matches2.length : 0;

    /// return the total of the mixture
    return count1 + count2;
  };

  // Insert renderer
  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const uuid = payload.uuid;
    const [type] = payload.arguments;

    // Generate unique identifier for macro renderer so that more than one word counter can be implemented in the same page
    const id = type.split('_')[1]?.trim();
    const wordcountId = `wordcount_${id}`;

    // Find word counter block so as to track children under it
    const headerBlock = await logseq.Editor.getBlock(uuid, {
      includeChildren: true,
    });
    const findRendererObj = headerBlock.children.find(
      (o) => o.content === `{{renderer :${wordcountId}}}`
    );

    // Function to retrieve number of words
    const returnNumberOfWords = async () => {
      let totalWords = 0;

      // Begin recursion
      const getCount = async (childrenArr) => {
        for (let a = 0; a < childrenArr.length; a++) {
          totalWords += mixedWordsFunction(childrenArr[a].content);

          if (childrenArr[a].children) {
            getCount(childrenArr[a].children);
          } else {
            return totalWords;
          }
        }
      };

      await getCount(headerBlock.children);
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
