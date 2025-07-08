export function getThumbnailUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(.+)\/original\.[^./]+$/);
  return match ? `${match[1]}/thumbnail.jpg` : null;
}
