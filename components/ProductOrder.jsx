'use client';
import { useState } from 'react';
import Link from 'next/link';

// Choix de la couleur + boutons de commande (le message WhatsApp reprend la couleur choisie).
export default function ProductOrder({ name, categoryLabel, colors, available, whatsappNumber }) {
  const [color, setColor] = useState(null);
  const needsColor = colors.length > 0;
  const canOrder = !needsColor || color;

  const message =
    `Bonjour, je suis intéressé(e) par le bijou « ${name} » (${categoryLabel})` +
    (color ? ` en couleur : ${color}.` : '.');
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="space-y-5">
      {needsColor && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B52] mb-2">
            Couleur{color ? ` : ${color}` : ''}
          </h2>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={color === c}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  color === c
                    ? 'bg-[#5A3E36] text-white border-[#5A3E36]'
                    : 'bg-white text-[#4A3B32] border-[#EFECE6] hover:border-[#5A3E36]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        {canOrder ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center bg-[#5A3E36] hover:bg-[#4A3B32] text-white font-bold px-8 py-3.5 rounded-2xl transition"
          >
            {available ? 'Commander sur WhatsApp' : 'Demander un bijou similaire'}
          </a>
        ) : (
          <span className="text-center bg-[#5A3E36]/40 text-white font-bold px-8 py-3.5 rounded-2xl cursor-not-allowed">
            Choisis une couleur pour commander
          </span>
        )}
        <Link
          href="/contact"
          className="text-center bg-white border border-[#EFECE6] hover:border-[#5A3E36] text-[#4A3B32] font-semibold px-8 py-3.5 rounded-2xl transition"
        >
          Me contacter
        </Link>
      </div>
    </div>
  );
}
