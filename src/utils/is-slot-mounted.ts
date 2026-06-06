// A macro's slot element is removed from the host DOM when its block scrolls out
// of view or the page changes. Calling logseq.provideUI against a missing slot
// makes Logseq core log "can not resolve selector target #slot__…". This checks
// the host document so we can skip rendering into a dead slot.
//
// The plugin runs in an iframe; the slots live in the parent/top window. If that
// document isn't reachable (e.g. a cross-origin dev sandbox) we can't inspect it,
// so we assume the slot is present rather than silently rendering nothing.
export const isSlotMounted = (slot: string): boolean => {
  let inspected = false
  for (const ctx of [window.parent, window.top]) {
    try {
      const doc = ctx?.document
      if (!doc) continue
      inspected = true
      if (doc.getElementById(slot)) return true
    } catch {
      // Cross-origin window — can't read its document.
    }
  }
  // Found a readable host document but the slot wasn't in it → genuinely gone.
  // Couldn't read any host document → don't block the render.
  return !inspected
}
