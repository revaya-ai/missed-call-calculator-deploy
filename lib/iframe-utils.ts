/**
 * Notify parent window of calculator height for iframe embedding
 * Sends postMessage to parent with current document height
 */
export function notifyParentOfHeight(): void {
  if (typeof window === 'undefined') return;

  if (window.parent !== window) {
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.offsetHeight
    );

    window.parent.postMessage({
      type: 'CALCULATOR_HEIGHT',
      height: height
    }, '*');
  }
}

/**
 * Check if running inside an iframe
 */
export function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  return window.self !== window.top;
}

/**
 * Safe focus - only focuses element if NOT in iframe
 * Prevents unwanted scroll behavior in parent window
 */
export function safeFocus(element: HTMLElement | null): void {
  if (!element || isInIframe()) return;
  element.focus();
}

/**
 * Disable all scroll behaviors when in iframe
 */
export function disableScrollInIframe(): void {
  if (typeof window === 'undefined' || !isInIframe()) return;

  // Disable scrollTo
  window.scrollTo = () => {};

  // Disable smooth scroll
  document.documentElement.style.scrollBehavior = 'auto';
}
