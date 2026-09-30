// Les photos de téléphone (iPhone) sont souvent en .heic, un format que Chrome, Firefox
// et Edge n'affichent pas. On demande à Cloudinary de livrer une version adaptée au
// navigateur (f_auto : jpg/webp/avif) et allégée (q_auto, largeur limitée).
export function optimizeImage(url, width = 1200) {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
