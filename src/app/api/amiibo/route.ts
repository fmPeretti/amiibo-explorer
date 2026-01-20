import { NextRequest, NextResponse } from 'next/server';

// AmiiboAPI - Free external API service
// https://www.amiiboapi.org/
const AMIIBO_API_BASE = 'https://www.amiiboapi.org/api';

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

    console.log('Proxying request to:', url);

    const response = await fetch(url);

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
