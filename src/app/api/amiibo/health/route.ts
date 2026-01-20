import { NextResponse } from 'next/server';

// AmiiboAPI health check endpoint
// Tests if the external AmiiboAPI service is available
const AMIIBO_API_BASE = 'https://www.amiiboapi.org/api';

export async function GET() {
  try {
    // Use a lightweight endpoint to check API health
    // The /amiibo endpoint with a limit of 1 is fast and reliable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${AMIIBO_API_BASE}/amiibo/?name=mario`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return NextResponse.json({
        status: 'online',
        message: 'AmiiboAPI is available',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        status: 'degraded',
        message: `AmiiboAPI returned status ${response.status}`,
        timestamp: new Date().toISOString(),
      }, { status: 200 }); // Return 200 so client can read the status
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('abort');

    return NextResponse.json({
      status: 'offline',
      message: isTimeout
        ? 'AmiiboAPI is not responding (timeout)'
        : `AmiiboAPI is unavailable: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    }, { status: 200 }); // Return 200 so client can read the status
  }
}
