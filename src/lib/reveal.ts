/**
 * Scroll-reveal via IntersectionObserver.
 * Adds `.is-visible` to `.reveal` elements when they enter the viewport.
 * Supports per-element stagger via `data-reveal-delay` (ms) -> transitionDelay.
 * Respects `prefers-reduced-motion`.
 */
export function initReveal(): void {
  if (typeof window === 'undefined') return;

  const els = Array.from(
    document.querySelectorAll<HTMLElement>('.reveal')
  );
  if (els.length === 0) return;

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    // Show everything immediately; no motion.
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = el.dataset.revealDelay;
        if (delay) {
          el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
        }
        el.classList.add('is-visible');
        obs.unobserve(el);
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.12,
    }
  );

  els.forEach((el) => observer.observe(el));
}

// Auto-init on load.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
}
