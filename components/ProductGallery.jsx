'use client';
import { optimizeImage } from '../lib/images';

// Galerie contrôlée : la photo affichée est choisie par le parent (ProductShowcase).
export default function ProductGallery({ images, name, current, onSelect }) {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-3xl bg-[#F7F4EE] border border-[#EFECE6] flex items-center justify-center text-[#6B5B52] text-sm">
        Pas de photo
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square rounded-3xl overflow-hidden bg-[#F7F4EE] border border-[#EFECE6]">
        <img src={optimizeImage(images[current], 1200)} alt={name} className="w-full h-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Voir la photo ${i + 1}`}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                i === current ? 'border-[#5A3E36]' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={optimizeImage(url, 200)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
