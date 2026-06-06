export interface RendererEntry {
  slot: string
  type: string
  target: string | undefined
  uuid: string
  pageId?: number
}

export type DbChangeHandler = (
  changedPageIds: Set<number>,
) => void | Promise<unknown>
