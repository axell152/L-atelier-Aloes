import Link from 'next/link';
import { SECTIONS } from '../lib/sections';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 px-4">
      <div className="text-center space-y-4 py-8 bg-white rounded-3xl border border-[#EFECE6] shadow-xs px-6">
        <span className="text-xs font-semibold tracking-wider uppercase bg-[#FF9CCB]/30 text-[#5A3E36] px-3 py-1 rounded-full">
          Créations artisanales & sur-mesure
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#4A3B32]">
          Bienvenue à L'Atelier Aloès
        </h1>
        <p className="text-[#6B5B52] max-w-xl mx-auto text-base">
          Choisissez votre univers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            className="bg-white p-6 rounded-3xl border border-[#EFECE6] hover:shadow-md transition flex flex-col gap-3 group"
          >
            <span className="text-3xl">{s.emoji}</span>
            <span className="font-serif font-bold text-xl text-[#4A3B32]">{s.label}</span>
            <span className="text-sm text-[#6B5B52] flex-1">{s.description}</span>
            <span className="text-[#6B5B52] group-hover:text-[#5A3E36] transition text-sm font-medium">
              Découvrir →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
