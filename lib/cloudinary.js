import crypto from 'crypto';

// Upload / suppression d'images sur Cloudinary, sans dépendance supplémentaire.
// Variables d'environnement à définir sur Vercel :
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

function config() {
  // trim + retrait d'éventuels guillemets : un espace ou un retour à la ligne collé
  // avec la valeur suffit à invalider la signature.
  const clean = (v) => (v || '').trim().replace(/^["']|["']$/g, '').trim();
  const cloud = clean(process.env.CLOUDINARY_CLOUD_NAME);
  const key = clean(process.env.CLOUDINARY_API_KEY);
  const secret = clean(process.env.CLOUDINARY_API_SECRET);
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
    let message = data?.error?.message || `Cloudinary a répondu ${res.status}`;
    if (/signature/i.test(message)) {
      // Diagnostic sans rien dévoiler de secret : seulement des longueurs.
      message = `Signature refusée. Valeurs lues par le site : cloud name « ${cloud} », clé de ${key.length} caractères (attendu : 15), secret de ${secret.length} caractères (attendu : 27). Vérifie les variables Vercel puis redéploie.`;
    }
    throw new Error(message);
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
