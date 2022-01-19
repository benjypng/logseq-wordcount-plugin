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

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand('character count', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcountchar_${uniqueIdentifier()}}}`
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

    // Function to retrieve number of words
    const returnNumberOfWords = async (type) => {
      let totalCount = 0;

      if (
        !type.startsWith(':wordcountchar_') &&
        !type.startsWith(':wordcount_')
      ) {
        return;
      } else if (type.startsWith(':wordcount_')) {
        // Begin recursion
        const getCount = async (childrenArr) => {
          for (let a = 0; a < childrenArr.length; a++) {
            totalCount += mixedWordsFunction(childrenArr[a].content);

            if (childrenArr[a].children) {
              getCount(childrenArr[a].children);
            } else {
              return totalCount;
            }
          }
        };

        await getCount(headerBlock.children);
        logseq.provideUI({
          key: `${wordcountId}`,
          slot,
          reset: true,
          template: `
          <button class="wordcount-btn" data-slot-id="${slot}" data-wordcount-id="${wordcountId}">Word count: ${totalCount}</button>
         `,
        });
      } else if (type.startsWith(':wordcountchar_')) {
        // Begin recursion
        const getCount = async (childrenArr) => {
          for (let a = 0; a < childrenArr.length; a++) {
            totalCount += childrenArr[a].content.length;

            if (childrenArr[a].children) {
              getCount(childrenArr[a].children);
            } else {
              return totalCount;
            }
          }
        };

        headerBlock.children ? await getCount(headerBlock.children) : '';

        logseq.provideUI({
          key: `${wordcountId}`,
          slot,
          reset: true,
          template: `
          <button class="wordcount-btn" data-slot-id="${slot}" data-wordcount-id="${wordcountId}">Character count: ${totalCount}</button>
         `,
        });
      }
    };

    await returnNumberOfWords(type);
  });
};

logseq.ready(main).catch(console.error);
