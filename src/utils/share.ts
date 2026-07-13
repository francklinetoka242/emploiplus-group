export function buildShareUrls(opts: { url: string; text: string }) {
  const u = encodeURIComponent(opts.url);
  const t = encodeURIComponent(opts.text);
  return {
    whatsapp: `https://api.whatsapp.com/send?text=${t}%20${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}%20${u}`,
  };
}
