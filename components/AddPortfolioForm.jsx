'use client';
import { useState, useTransition } from 'react';

// Même logique de compression que pour les produits : une photo de téléphone
// devient un JPEG léger avant d'être envoyé au serveur.
async function compressImage(file, maxDim, quality) {
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
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (err) {
    console.error('Compression impossible, envoi du fichier original :', err);
    return file;
  }
}

export default function AddPortfolioForm({ action, sections = [] }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState('idle'); // idle | compressing | submitting
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setStatus('compressing');
    const file = formData.get('image');
    if (file instanceof File && file.size > 0) {
      formData.set('image', await compressImage(file, 1600, 0.8));
    }

    setStatus('submitting');
    setError('');
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          form.reset();
        }
      } catch (err) {
        setError("L'envoi a échoué. Réessaie dans un instant.");
      }
      setStatus('idle');
    });
  };

  const busy = status !== 'idle';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#6B5B52] mb-1">Section</label>
        <select
          name="section"
          defaultValue={sections[0]?.slug}
          className="w-full border border-[#EFECE6] rounded-2xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3E36]"
        >
          {sections.map((s) => (
            <option key={s.slug} value={s.slug}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#6B5B52] mb-1">Photo</label>
        <input required type="file" name="image" accept="image/*" className="w-full text-sm text-[#6B5B52]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#6B5B52] mb-1">Légende (optionnel)</label>
        <input
          type="text"
          name="caption"
          placeholder="Ex: Pochette chat mystique"
          className="w-full border border-[#EFECE6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A3E36]"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-2.5">
          Photo non enregistrée : {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[#5A3E36] hover:bg-[#4A3B32] disabled:opacity-60 text-white font-bold py-3 rounded-2xl transition"
      >
        {status === 'compressing' && 'Compression de la photo...'}
        {status === 'submitting' && 'Enregistrement...'}
        {status === 'idle' && 'Ajouter au portfolio'}
      </button>
    </form>
  );
}
