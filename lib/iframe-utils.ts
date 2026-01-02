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
