import sql, { initDb } from '../../../lib/db';
import Link from 'next/link';

export const revalidate = 0;

export default async function TarifsPage() {
  await initDb();

  const rows = await sql`
    SELECT category, MIN(position) AS position
    FROM pricing_tables
    GROUP BY category
    ORDER BY MIN(position), category
  `;

  const categories = rows.map((r) => r.category);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#4A3B32]">Tarifs personnalisation</h1>
        <p className="text-[#6B5B52] max-w-xl mx-auto">
          Choisissez une catégorie pour voir le détail des tarifs. Pour un devis précis adapté à votre projet, contactez-moi.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#EFECE6] text-[#6B5B52]">
          <p className="text-lg">Les tarifs seront bientôt disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/personnalisation/tarifs/${encodeURIComponent(category)}`}
              className="bg-white p-6 rounded-3xl border border-[#EFECE6] hover:shadow-md transition flex items-center justify-between group"
            >
              <span className="font-serif font-bold text-lg text-[#4A3B32]">{category}</span>
              <span className="text-[#6B5B52] group-hover:text-[#5A3E36] transition">→</span>
            </Link>
          ))}
        </div>
      )}

      <div className="text-center bg-white rounded-3xl border border-[#EFECE6] shadow-xs py-10 px-6 space-y-4">
        <h3 className="text-xl font-serif font-bold text-[#4A3B32]">Un projet en tête ?</h3>
        <p className="text-[#6B5B52] max-w-md mx-auto">
          Ces tarifs sont indicatifs — contactez-moi pour un devis adapté à votre demande.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-[#5A3E36] hover:bg-[#4A3B32] text-white font-bold px-8 py-3.5 rounded-2xl transition"
        >
          Demander un devis
        </Link>
      </div>
    </div>
  );
}
