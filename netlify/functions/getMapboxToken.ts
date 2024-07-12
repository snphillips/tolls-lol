/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */

export async function handler(_event: any, _context: any) {
  try {
    const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

    if (!MAPBOX_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'MAPBOX_TOKEN is not set' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: MAPBOX_TOKEN }),
    };
  } catch (error) {
    console.error('Error fetching token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
