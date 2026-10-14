import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageUrl, seoFor } from '../seo.js';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Keeps the title, description, canonical, and social tags in sync on client-side navigation.
// The initial values come from the prerendered HTML.
export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/';
    const page = seoFor(path);
    const url = pageUrl(page.noindex ? '/' : path);

    document.title = page.title;
    setMeta('name', 'description', page.description);
    setMeta('name', 'robots', page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMeta('property', 'og:title', page.title);
    setMeta('property', 'og:description', page.description);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', page.title);
    setMeta('name', 'twitter:description', page.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [pathname]);

  return null;
}
