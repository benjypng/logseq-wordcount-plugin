import { BlockEntity } from "@logseq/libs/dist/LSPlugin";

export default function highlight(block: BlockEntity): boolean {
  return block.properties != null && "backgroundColor" in block.properties;
}