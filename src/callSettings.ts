import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export const callSettings = () => {
  const settings: SettingSchemaDesc[] = [
    {
      key: "wordCountStr",
      type: "string",
      default: "Word count:",
      description: "Customise the text that is shown in the word-counter.",
      title: "Customise wordcount text",
    },
    {
      key: "characterCountStr",
      type: "string",
      default: "Character count:",
      description: "Customise the text that is shown in the character-counter.",
      title: "Customise wordcount text",
    },
  ];
  logseq.useSettingsSchema(settings);
};
