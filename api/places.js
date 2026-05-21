import { handlePlacesRequest } from '../server/places.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const host = req.headers.host || 'localhost';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const requestUrl = `${protocol}://${host}${req.url}`;
  const result = await handlePlacesRequest(requestUrl);
  res.status(result.status).json(result.body);
}
