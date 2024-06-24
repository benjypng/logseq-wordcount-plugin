import "@logseq/libs";
import getCount from "./services/getCount";
import { parseQuery } from "./services/query.ts";
import renderCount from "./services/renderCount";
import { settings } from "./services/settings";
import { provideStyles } from "./styles";

const main = async () => {
  console.log("Wordcount plugin loaded");

  provideStyles();

  logseq.Editor.registerSlashCommand("Word count", async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcount_}}`);
  });

  logseq.Editor.registerSlashCommand("Writing session target", async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcount_, --target 500}}`);
  });

  logseq.Editor.registerSlashCommand("Character count", async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcount_, --characters}}`);
  });

  logseq.Editor.registerSlashCommand("Word count - page", async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :wordcount_, --page}}`);
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const uuid = payload.uuid;
    const [type, query] = payload.arguments;
    if (!type.startsWith(":wordcount_"))
      return;

    const wordcountId = `wordcount_${type.split("_")[1]?.trim()}_${slot}`;

    const headerBlock = await logseq.Editor.getBlock(uuid, {
      includeChildren: true,
    });

    try {
      let countResult = await getCount(
        headerBlock!,
        query
      );
      renderCount(slot, wordcountId, countResult);
    } catch (error) {
      console.error(error);
      logseq.UI.showMsg(
        "Please do not change the render parameters except for your writing target.",
        "error"
      );
    }
  });

  logseq.DB.onChanged(async function ({ blocks }) {
    const block = blocks[0];
    if (!block.page) {
      return;
    }
    const page = (await logseq.Editor.getPage(block.page.id))!;
    const firstBlock = (await logseq.Editor.getPageBlocksTree(page.name))[0];
    if (block.id == firstBlock.id) {
      return;
    }
    const match = /\{\{renderer :wordcount_,(.*?)\}\}/.exec(firstBlock.content);
    if (!match) {
      return;
    }
    const queryOptions = parseQuery(match[1]);
    if (queryOptions.countingContext != "page") { return; }
    // Temporary way to rerender page counter (until a better one is found)
    await logseq.Editor.updateBlock(firstBlock.uuid, firstBlock.content + "­");
    await logseq.Editor.updateBlock(firstBlock.uuid, firstBlock.content);
  });
};

logseq.useSettingsSchema(settings).ready(main).catch(console.error);
