import { hub, riffle, dish, stack, loupe, terminal } from './vendor/hairline.js';

// These illustrations supplement the headings; they are not controls or content.
const figures = Object.freeze({ hub, riffle, dish, stack, loupe, terminal });
const selector = '.section-art[data-figure]';
const instances = new Map();
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

function render(element, record) {
  record.instance?.destroy();

  const reduced = motionPreference.matches;
  element.classList.toggle('is-motion-reduced', reduced);
  element.style.pointerEvents = reduced ? 'none' : record.pointerEvents;
  element.setAttribute('aria-hidden', 'true');
  element.setAttribute('role', 'presentation');
  // Prevent Riffle from creating a tab stop during mounting, then remove it.
  element.setAttribute('tabindex', '-1');

  record.instance = record.create(element, {
    intensity: reduced ? 0 : 0.35,
    theme: 'auto',
    play: false,
  });

  element.removeAttribute('tabindex');
  element.removeAttribute('aria-label');
  element.querySelector('[data-hairline-live]')?.remove();
  for (const svg of element.querySelectorAll('svg')) {
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
  }
}

/** Mount each supported decorative figure once. Safe to call after adding markup. */
export function initIllustrations(root = document) {
  // The upstream animation scheduler requires IntersectionObserver.
  if (!('IntersectionObserver' in window)) return 0;

  const elements = [...root.querySelectorAll(selector)];
  if (root instanceof Element && root.matches(selector)) elements.unshift(root);

  let added = 0;
  for (const element of elements) {
    const create = figures[element.dataset.figure];
    if (typeof create !== 'function' || instances.has(element)) continue;
    const record = { create, instance: null, pointerEvents: element.style.pointerEvents };
    render(element, record);
    instances.set(element, record);
    added += 1;
  }
  return added;
}

/** Remove figures and upstream listeners within a container. */
export function destroyIllustrations(root = document) {
  for (const [element, record] of instances) {
    if (element !== root && !root.contains(element)) continue;
    record.instance.destroy();
    element.style.pointerEvents = record.pointerEvents;
    element.classList.remove('is-motion-reduced');
    instances.delete(element);
  }
}

motionPreference.addEventListener('change', () => {
  // Remount at rest so enabling reduced motion also ends an active pointer pose.
  for (const [element, record] of instances) {
    if (element.isConnected) render(element, record);
    else {
      record.instance.destroy();
      instances.delete(element);
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initIllustrations(), { once: true });
} else {
  initIllustrations();
}
