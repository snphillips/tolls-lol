/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function handler(_event, _context) {
  const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

  return {
    statusCode: 200,
    body: JSON.stringify({ token: MAPBOX_TOKEN }),
  };
}
