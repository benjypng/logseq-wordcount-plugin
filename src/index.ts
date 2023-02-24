import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import getCount from "./services/getCount";
import renderCount from "./services/renderCount";
import { settings } from "./services/settings";
import { mixedWordsFunction, simpleWordsFunction } from "./services/countWords";

const main = async () => {
  console.log("Wordcount plugin loaded");

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

  logseq.Editor.registerSlashCommand("Word count", async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcount_}}`);
  });

  logseq.Editor.registerSlashCommand("Writing session target", async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcount_, 500}}`);
  });

  logseq.Editor.registerSlashCommand("Character count", async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcountchar_}}`);
  });

  logseq.Editor.registerSlashCommand("Word count - page", async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcount-page_}}`);
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const uuid = payload.uuid;
    const [type, target] = payload.arguments;
    if (!type.startsWith(":wordcountchar_") && !type.startsWith(":wordcount_"))
      return;

    const wordcountId = `wordcount_${type.split("_")[1]?.trim()}_${slot}`;

    const headerBlock = await logseq.Editor.getBlock(uuid, {
      includeChildren: true,
    });

    if (type.startsWith(":wordcount_")) {
      let totalCount = getCount(
        headerBlock!.children as BlockEntity[],
        "words"
      );
      renderCount(slot, wordcountId, type, target, totalCount);
    } else if (type.startsWith(":wordcountchar_")) {
      let totalCount = getCount(
        headerBlock!.children as BlockEntity[],
        "chars"
      );
      renderCount(slot, wordcountId, type, target, totalCount);
    } else {
      logseq.UI.showMsg(
        "Please do not change the render parameters except for your writing target.",
        "error"
      );
    }
  });

  // Calculate number of words on page
  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type, count] = payload.arguments;
    if (!type.startsWith(":wordcount-page_")) return;

    logseq.DB.onChanged(async function ({ blocks }) {
      if (blocks.length === 2) {
        const pbt = await logseq.Editor.getPageBlocksTree(blocks[1].name);
        let totalCount = getCount(pbt, "words");
        await logseq.Editor.updateBlock(
          payload.uuid,
          `{{renderer :wordcount-page_, ${totalCount - 3}}}`
        );
      }
    });

    renderCount(slot, slot, type, undefined, parseInt(count));
  });
};

logseq.useSettingsSchema(settings).ready(main).catch(console.error);
