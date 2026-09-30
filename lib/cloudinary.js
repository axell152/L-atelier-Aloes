import crypto from 'crypto';

// Upload / suppression d'images sur Cloudinary, sans dépendance supplémentaire.
// Variables d'environnement à définir sur Vercel :
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

function config() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    throw new Error('Variables Cloudinary manquantes (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).');
  }
  return { cloud, key, secret };
}

function sign(params, secret) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + secret).digest('hex');
}

export function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

export async function uploadImage(file, folder = 'portfolio') {
  const { cloud, key, secret } = config();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ folder, timestamp }, secret);

  const body = new FormData();
  body.append('file', file);
  body.append('api_key', key);
  body.append('timestamp', String(timestamp));
  body.append('folder', folder);
  body.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Cloudinary a répondu ${res.status}`);
  }
  return data.secure_url;
}

export async function deleteImage(url) {
  if (!isCloudinaryUrl(url)) return;
  const { cloud, key, secret } = config();

  // https://res.cloudinary.com/<cloud>/image/upload/v123/portfolio/abc.jpg -> portfolio/abc
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  if (!match) return;
  const publicId = match[1];

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ public_id: publicId, timestamp }, secret);

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: key,
    timestamp: String(timestamp),
    signature,
  });

  await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: 'POST', body });
}
