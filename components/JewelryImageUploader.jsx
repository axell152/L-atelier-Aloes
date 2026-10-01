'use client';
import { useState } from 'react';
import { uploadFilesOneByOne } from '../lib/compressImage';

// Ajoute des photos (une ou plusieurs) à un bijou existant.
export default function JewelryImageUploader({ productId, action }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const files = Array.from(new FormData(form).getAll('image')).filter((f) => f instanceof File && f.size > 0);
    if (files.length === 0) return;

    setBusy(true);
    setError('');
    const { saved, failures } = await uploadFilesOneByOne(
      files,
      action,
      { productId: String(productId) },
      (current, total) => setProgress(`${current}/${total}`)
    );
    if (failures.length === 0) form.reset();
    else setError(`${saved} photo(s) ajoutée(s) sur ${files.length}. Échec : ${failures.join(' | ')}`);
    setBusy(false);
    setProgress('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input required multiple type="file" name="image" accept="image/*" className="block w-full text-sm text-[#6B5B52]" />
      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#5A3E36] text-white hover:bg-[#4A3B32] disabled:opacity-60"
      >
        {busy ? `Envoi ${progress}...` : 'Ajouter ces photos'}
      </button>
    </form>
  );
}
