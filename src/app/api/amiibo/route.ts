import { NextRequest, NextResponse } from 'next/server';

// AmiiboAPI - Free external API service
// https://www.amiiboapi.org/
const AMIIBO_API_BASE = 'https://www.amiiboapi.org/api';

// Cache durations in seconds
const CACHE_DURATION = {
  amiibo: 86400,      // 24 hours - amiibo data rarely changes
  type: 604800,       // 7 days - types almost never change
  amiiboseries: 604800, // 7 days - series almost never change
  gameseries: 604800,   // 7 days - game series almost never change
  character: 604800,    // 7 days - characters almost never change
  default: 86400,     // 24 hours - default for other endpoints
};

export async function GET(request: NextRequest) {
  try {
    // Get the path from query params
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path') || '';

    // Build the URL with all query params except 'path'
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'path') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `${AMIIBO_API_BASE}/${path}${queryString ? `?${queryString}` : ''}`;

    // Determine cache duration based on the endpoint
    const endpoint = path.split('/')[0] || 'default';
    const revalidate = CACHE_DURATION[endpoint as keyof typeof CACHE_DURATION] || CACHE_DURATION.default;

    const response = await fetch(url, {
      next: { revalidate }, // Cache with revalidation
    });

    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      return NextResponse.json(
        { error: `API returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch from Amiibo API', details: errorMessage },
      { status: 500 }
    );
  }
}
