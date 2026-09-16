/**
 * Legacy Vim OS SDK capabilities with no counterpart on Vim Connect.
 *
 * These are deliberately no-ops rather than substitutes: each needs a product decision, and
 * a plausible-looking replacement would hide that decision inside the migration. Delete a
 * function here once its question is answered, and fix its call sites then.
 */

/**
 * `vimOS.hub.setDynamicAppSize(size)`.
 *
 * Absent from Vim Connect's hub. In the side panel the provider chooses the width and
 * Chrome remembers it per install, so an app cannot resize itself.
 *
 * QUESTION: does this app need run-time sizing, or is the manifest size acceptable?
 */
export function setDynamicAppSizeUnsupported(_size: "CLASSIC" | "LARGE"): void {
  // no-op
}

/**
 * `vimOS.utils.copyToClipboard(text)`.
 *
 * There is no `utils` namespace on Vim Connect.
 *
 * QUESTION: must clipboard access go through the Hub, or is `navigator.clipboard` enough in
 * the app's iframe? Note this app already calls `navigator.clipboard.writeText` directly in
 * NotesScreen's `handleCopy`, so the two halves disagree today.
 */
export function copyToClipboardUnsupported(_text: string): void {
  // no-op
}
