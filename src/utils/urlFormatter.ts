export function ensureHttpsPrefix(url: string): string {
  if (!url) return url;
  
  // Remove any whitespace
  const trimmedUrl = url.trim();
  
  // If it already has http:// or https://, return as is
  if (trimmedUrl.match(/^https?:\/\//i)) {
    return trimmedUrl;
  }
  
  // Otherwise, add https://
  return `https://${trimmedUrl}`;
}
