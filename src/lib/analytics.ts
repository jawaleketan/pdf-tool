/**
 * Privacy-preserving analytics utility.
 * Gated by consent stored in localStorage ('pdf_utils_consent').
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}

export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('pdf_utils_consent') === 'accepted';
  } catch {
    return false;
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  if (!hasConsent()) return;

  if (typeof window !== 'undefined') {
    console.log('[Analytics]', event.name, event.properties || {});
  }
}
