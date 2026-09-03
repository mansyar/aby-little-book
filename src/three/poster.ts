// Deterministic poster stand-in: a labelled night-lake card used wherever
// the hybrid stage needs a fallback image. Real rest/response stills ship
// with the package layout (render_previews.py); until a spread has one,
// this keeps the fallback path honest and labelled instead of blank.
export function posterFor(title: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="820"><rect width="100%" height="100%" fill="#0a1830"/><text x="50%" y="50%" fill="#ffb45e" font-size="48" text-anchor="middle">${title}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
