import Link from 'next/link';
import sql, { initDb } from '../../lib/db';
import { JEWELRY_SUBCATEGORIES } from '../../lib/bijoux';

export const revalidate = 0;
export const metadata = { title: "Bijoux | L'Atelier Aloès" };

export default async function BijouxPage() {
  await initDb();
  const counts = await sql`
    SELECT subcategory, COUNT(*)::int AS total
    FROM jewelry_items
    GROUP BY subcategory
  `;
  const countOf = (slug) => counts.find((c) => c.subcategory === slug)?.total || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4">
      <div className="text-center space-y-4 py-8 bg-white rounded-3xl border border-[#EFECE6] shadow-xs px-6">
        <span className="text-xs font-semibold tracking-wider uppercase bg-[#FF9CCB]/30 text-[#5A3E36] px-3 py-1 rounded-full">
          Créations artisanales & sur-mesure
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#4A3B32]">Bijoux</h1>
        <p className="text-[#6B5B52] max-w-xl mx-auto text-base">
          Bijoux faits main, pièces uniques et petites séries.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {JEWELRY_SUBCATEGORIES.map((sc) => (
          <Link
            key={sc.slug}
            href={`/bijoux/${sc.slug}`}
            className="bg-white p-6 rounded-3xl border border-[#EFECE6] hover:shadow-md transition flex items-center justify-between group"
          >
            <div>
              <span className="font-serif font-bold text-lg text-[#4A3B32] block">{sc.label}</span>
              <span className="text-xs text-[#6B5B52]">
                {countOf(sc.slug) === 0 ? 'Bientôt' : `${countOf(sc.slug)} création${countOf(sc.slug) > 1 ? 's' : ''}`}
              </span>
            </div>
            <span className="text-[#6B5B52] group-hover:text-[#5A3E36] transition">→</span>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/contact"
          className="inline-block bg-[#5A3E36] hover:bg-[#4A3B32] text-white font-bold px-8 py-3.5 rounded-2xl transition"
        >
          Me contacter
        </Link>
      </div>
    </div>
  );
}
