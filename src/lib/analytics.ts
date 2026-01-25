export type AnalyticsEvent =
  | "template_generated"
  | "template_downloaded_pdf"
  | "template_downloaded_images";

interface EventData {
  template_type?: "coin" | "card";
  item_count?: number;
  page_count?: number;
}

/**
 * Track an analytics event via server API
 * Fails silently - analytics should never break the app
 */
export async function trackEvent(
  event: AnalyticsEvent,
  data?: EventData
): Promise<void> {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: event, metadata: data || {} }),
    });
  } catch {
    // Fail silently
  }
}
