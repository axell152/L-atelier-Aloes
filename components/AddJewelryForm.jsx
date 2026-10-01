'use client';
import { useState } from 'react';
import { uploadFilesOneByOne } from '../lib/compressImage';

const field =
  'w-full border border-[#EFECE6] rounded-2xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3E36]';
const label = 'block text-sm font-medium text-[#6B5B52] mb-1';

export default function AddJewelryForm({ createAction, imageAction, subcategories }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll('image').filter((f) => f instanceof File && f.size > 0);
    if (files.length === 0) {
      setError('Ajoute au moins une photo.');
      return;
    }
    formData.delete('image');

    setBusy(true);
    setError('');
    setProgress('Création de la fiche...');

    const created = await createAction(formData);
    if (created?.error) {
      setError(created.error);
      setBusy(false);
      setProgress('');
      return;
    }

    const { saved, failures } = await uploadFilesOneByOne(
      files,
      imageAction,
      { productId: String(created.id) },
      (current, total) => setProgress(`Photo ${current}/${total}...`)
    );

    if (failures.length === 0) {
      form.reset();
    } else {
      setError(
        `La fiche est créée avec ${saved} photo(s) sur ${files.length}. Échec : ${failures.join(' | ')}. Tu peux ajouter les photos manquantes depuis la liste ci-dessous.`
      );
    }
    setBusy(false);
    setProgress('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Nom du bijou</label>
          <input required name="name" className={field} placeholder="Ex. Bracelet perles roses" />
        </div>
        <div>
          <label className={label}>Sous-catégorie</label>
          <select required name="subcategory" defaultValue="" className={field}>
            <option value="" disabled>Choisir...</option>
            {subcategories.map((s) => (
              <option key={s.slug} value={s.slug}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Prix en € (vide = sur demande)</label>
          <input name="price" inputMode="decimal" className={field} placeholder="Ex. 25" />
        </div>
        <div>
          <label className={label}>Matières (optionnel)</label>
          <input name="materials" className={field} placeholder="Ex. Acier inoxydable, perles de verre" />
        </div>
      </div>
      <div>
        <label className={label}>Couleurs proposées (optionnel, séparées par des virgules)</label>
        <input name="colors" className={field} placeholder="Ex. Doré, Argenté, Rose, Noir" />
      </div>
      <div>
        <label className={label}>Description (optionnel)</label>
        <textarea name="description" rows={4} className={field} placeholder="Taille, particularités, entretien..." />
      </div>
      <div>
        <label className={label}>Photos (plusieurs possibles, la première sera la photo principale)</label>
        <input required multiple type="file" name="image" accept="image/*" className="block w-full text-sm text-[#6B5B52]" />
      </div>
      <label className="flex items-center gap-2 text-sm text-[#4A3B32]">
        <input type="checkbox" name="is_available" defaultChecked className="w-4 h-4 accent-[#5A3E36]" />
        Disponible
      </label>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-2.5">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[#5A3E36] hover:bg-[#4A3B32] disabled:opacity-60 text-white font-bold py-3 rounded-2xl transition"
      >
        {busy ? progress : 'Créer la fiche'}
      </button>
    </form>
  );
}
