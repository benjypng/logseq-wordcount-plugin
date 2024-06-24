import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { typeFlag } from "type-flag";
import highlight from "./filters/highlighted.ts";

type Filter = ((block: BlockEntity) => boolean);

export interface Options {
  countingType: "words" | "characters";
  target?: number;
  filters: Filter[];
}

const optionsSchemas = {
  characters: Boolean,
  target: Number,
  "filter-highlight": Boolean,
};

export function parseQuery(query: string): Options {
  const parsing = typeFlag(optionsSchemas, query.split(" "));
  if (Object.entries(parsing.unknownFlags).length > 0) {
    throw new Error("invalid word counting query arguments")
  }
  const filters: Filter[] = [];
  if (parsing.flags["filter-highlight"]) {
    filters.push(highlight);
  }
  return {
    countingType: parsing.flags.characters ? "characters" : "words",
    target: parsing.flags.target,
    filters
  };
}