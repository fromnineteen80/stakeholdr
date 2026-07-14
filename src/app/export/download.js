/* download.js — the ONE browser file-delivery helper (Phase 19 refactor,
 * replace-don't-duplicate): Blob + temporary anchor click, the sealed CSV
 * delivery mechanic generalized. Moved verbatim from the Phase-18 import
 * wizard; the template downloads and the plan Word export both deliver
 * through THIS function.
 */
export function downloadBlob(bytes, filename, mime) {
  try {
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch { /* headless/test contexts */ }
}
