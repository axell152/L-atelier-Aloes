'use client';
import { useState } from 'react';

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
  const [status, setStatus] = useState('idle'); // idle | compressing | submitting
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [sectionSlug, setSectionSlug] = useState(sections[0]?.slug);
  const subcategories = sections.find((s) => s.slug === sectionSlug)?.subcategories || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll('image').filter((f) => f instanceof File && f.size > 0);
    if (files.length === 0) return;

    setError('');
    const failures = [];
    let saved = 0;

    // Une photo à la fois : évite la limite de taille des requêtes Vercel et permet
    // de continuer si l'une d'elles échoue.
    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i + 1, total: files.length });

      setStatus('compressing');
      const compressed = await compressImage(files[i], 1600, 0.8);

      setStatus('submitting');
      const single = new FormData();
      for (const [key, value] of formData.entries()) {
        if (key !== 'image') single.append(key, value);
      }
      single.set('image', compressed);

      try {
        const result = await action(single);
        if (result?.error) {
          failures.push(`${files[i].name} : ${result.error}`);
        } else {
          saved++;
        }
      } catch (err) {
        failures.push(`${files[i].name} : l'envoi a échoué.`);
      }
    }

    if (failures.length === 0) {
      form.reset();
      setSectionSlug(sections[0]?.slug);
    } else {
      setError(`${saved} photo(s) enregistrée(s) sur ${files.length}. Échec : ${failures.join(' | ')}`);
    }
    setStatus('idle');
    setProgress({ current: 0, total: 0 });
  };

  const busy = status !== 'idle';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#6B5B52] mb-1">Section</label>
        <select
          name="section"
          defaultValue={sections[0]?.slug}
          onChange={(e) => setSectionSlug(e.target.value)}
          className="w-full border border-[#EFECE6] rounded-2xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3E36]"
        >
          {sections.map((s) => (
            <option key={s.slug} value={s.slug}>{s.label}</option>
          ))}
        </select>
      </div>
      {subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[#6B5B52] mb-1">Sous-catégorie</label>
          <select
            required
            name="subcategory"
            defaultValue=""
            className="w-full border border-[#EFECE6] rounded-2xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3E36]"
          >
            <option value="" disabled>Choisir...</option>
            {subcategories.map((s) => (
              <option key={s.slug} value={s.slug}>{s.label}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-[#6B5B52] mb-1">Photos (tu peux en sélectionner plusieurs)</label>
        <input required multiple type="file" name="image" accept="image/*" className="w-full text-sm text-[#6B5B52]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#6B5B52] mb-1">Légende (optionnel, appliquée à toutes les photos)</label>
        <input
          type="text"
          name="caption"
          placeholder="Ex: Pochette chat mystique"
          className="w-full border border-[#EFECE6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A3E36]"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-2.5">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[#5A3E36] hover:bg-[#4A3B32] disabled:opacity-60 text-white font-bold py-3 rounded-2xl transition"
      >
        {status === 'compressing' && `Compression ${progress.current}/${progress.total}...`}
        {status === 'submitting' && `Enregistrement ${progress.current}/${progress.total}...`}
        {status === 'idle' && 'Ajouter au portfolio'}
      </button>
    </form>
  );
}
