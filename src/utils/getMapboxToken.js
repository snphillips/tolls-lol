export async function getMapboxToken() {
  const response = await fetch('/.netlify/functions/getMapboxToken');
  const data = await response.json();
  return data.token;
}
