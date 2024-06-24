import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { typeFlag } from "type-flag";

export interface Options {
  countingType: "words" | "characters";
  target?: number;
}

const optionsSchemas = {
  characters: Boolean,
  target: Number,
};

export function parseQuery(query: string): Options {
  const parsing = typeFlag(optionsSchemas, query.split(" "));
  if (Object.entries(parsing.unknownFlags).length > 0) {
    throw new Error("invalid word counting query arguments")
  }
  return {
    countingType: parsing.flags.characters ? "characters" : "words",
    target: parsing.flags.target,
  };
}