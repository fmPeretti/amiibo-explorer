export type AnalyticsEvent =
  | "template_generated"
  | "template_downloaded_pdf"
  | "template_downloaded_images";

interface EventData {
  template_type?: "coin" | "card";
  item_count?: number;
  page_count?: number;
}

const VISITOR_ID_KEY = "amiibo_visitor_id";

function getVisitorId(): string | null {
  if (typeof window === "undefined") return null;

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
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
    const visitorId = getVisitorId();
    const metadata = {
      ...data,
      visitor_id: visitorId,
    };

    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: event, metadata }),
    });
  } catch {
    // Fail silently
  }
}
