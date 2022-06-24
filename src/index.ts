import "@logseq/libs";
import { callSettings } from "./callSettings";
import { mixedWordsFunction } from "./mixedWordsFunction";

// Generate unique identifier
const uniqueIdentifier = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "");

const main = async () => {
  console.log("Wordcount plugin loaded");

  callSettings();

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
  logseq.Editor.registerSlashCommand("Word count", async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcount_${uniqueIdentifier()}}}`
    );
  });

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand("Writing session target", async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcount_${uniqueIdentifier()}, 500}}`
    );
  });

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand("Character count", async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :wordcountchar_${uniqueIdentifier()}}}`
    );
  });

  // Insert renderer
  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const uuid = payload.uuid;
    const [type, target] = payload.arguments;

    // Generate unique identifier for macro renderer so that more than one word counter can be implemented in the same page
    const id = type.split("_")[1]?.trim();
    const wordcountId = `wordcount_${id}`;

    // Find word counter block so as to track children under it
    const headerBlock = await logseq.Editor.getBlock(uuid, {
      includeChildren: true,
    });

    // Function to retrieve number of words
    const returnNumberOfWords = async (type) => {
      let totalCount = 0;

      if (
        !type.startsWith(":wordcountchar_") &&
        !type.startsWith(":wordcount_")
      ) {
        return;
      } else if (type.startsWith(":wordcount_")) {
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

        if (target === undefined) {
          logseq.provideUI({
            key: `${wordcountId}`,
            slot,
            reset: true,
            template: `
          <button class="wordcount-btn" data-slot-id="${slot}" data-wordcount-id="${wordcountId}">${logseq.settings.wordCountStr} ${totalCount}</button>
         `,
          });
        } else {
          const percentage = Math.round((totalCount / parseInt(target)) * 100);
          logseq.provideUI({
            key: `${wordcountId}`,
            slot,
            reset: true,
            template: `
          <button class="wordcount-btn" data-slot-id="${slot}" data-wordcount-id="${wordcountId}">Writing Target: ${percentage}% (${totalCount}/${target})</button>
         `,
          });
        }
      } else if (type.startsWith(":wordcountchar_")) {
        // Begin recursion
        const getCount = async (childrenArr: any[]) => {
          for (let a = 0; a < childrenArr.length; a++) {
            totalCount += childrenArr[a].content.length;

            if (childrenArr[a].children) {
              getCount(childrenArr[a].children);
            } else {
              return totalCount;
            }
          }
        };

        headerBlock.children ? await getCount(headerBlock.children) : "";

        logseq.provideUI({
          key: `${wordcountId}`,
          slot,
          reset: true,
          template: `
          <button class="wordcount-btn" data-slot-id="${slot}" data-wordcount-id="${wordcountId}">${logseq.settings.characterCountStr} ${totalCount}</button>
         `,
        });
      }
    };

    await returnNumberOfWords(type);
  });
};

logseq.ready(main).catch(console.error);
