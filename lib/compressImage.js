// Utilitaire côté navigateur : transforme une photo de téléphone en JPEG léger avant envoi.
export async function compressImage(file, maxDim = 1600, quality = 0.8) {
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (err) {
    console.error('Compression impossible, envoi du fichier original :', err);
    return file;
  }
}

// Envoie les fichiers un par un (limite de taille des requêtes Vercel) et continue si l'un échoue.
export async function uploadFilesOneByOne(files, action, extraFields, onProgress) {
  const failures = [];
  let saved = 0;
  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length);
    const compressed = await compressImage(files[i]);
    const fd = new FormData();
    for (const [key, value] of Object.entries(extraFields)) fd.append(key, value);
    fd.set('image', compressed);
    try {
      const result = await action(fd);
      if (result?.error) failures.push(`${files[i].name} : ${result.error}`);
      else saved++;
    } catch {
      failures.push(`${files[i].name} : l'envoi a échoué.`);
    }
  }
  return { saved, failures };
}
