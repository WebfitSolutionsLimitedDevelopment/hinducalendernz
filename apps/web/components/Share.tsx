/** Share links (no tracking scripts). */
export function Share({ url, text }: { url: string; text: string }) {
  const u = encodeURIComponent(url), t = encodeURIComponent(text);
  return (
    <p className="share small">
      Share: <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noopener">WhatsApp</a>
      {' · '}<a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener">Facebook</a>
      {' · '}<a href={`mailto:?subject=${t}&body=${encodeURIComponent(`${text}\n${url}`)}`}>Email</a>
    </p>
  );
}
