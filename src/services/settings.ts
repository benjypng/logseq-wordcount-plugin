import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export const settings: SettingSchemaDesc[] = [
  {
    key: "wordCountStr",
    type: "string",
    default: "Word count:",
    description: "Customise the text that is shown in the word-counter.",
    title: "Customise word count text",
  },
  {
    key: "characterCountStr",
    type: "string",
    default: "Character count:",
    description: "Customise the text that is shown in the character-counter.",
    title: "Customise character count text",
  },
  {
    key: "forceWordCount",
    type: "boolean",
    default: false,
    description:
      "Forces counting cyrillic characters in words instead of individual characters (.e.g for Russian language to be counted correctly)a,",
    title: "Force Word Count (for Cyrillic characters)",
  },
];
