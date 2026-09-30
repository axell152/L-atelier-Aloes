import sql, { initDb } from '../../lib/db';
import Link from 'next/link';

export const revalidate = 0;

export default async function HomePage() {
  await initDb();
  const items = await sql`SELECT * FROM portfolio_items ORDER BY position, id DESC`;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 px-4">
      {/* En-tête / Bannière */}
      <div className="text-center space-y-4 py-8 bg-white rounded-3xl border border-[#EFECE6] shadow-xs px-6">
        <span className="text-xs font-semibold tracking-wider uppercase bg-[#FF9CCB]/30 text-[#5A3E36] px-3 py-1 rounded-full">
          Créations artisanales & sur-mesure
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#4A3B32]">
          Personnalisation
        </h1>
        <p className="text-[#6B5B52] max-w-xl mx-auto text-base">
          Objets & vêtements personnalisés
        </p>
      </div>

      {/* Portfolio */}
      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-bold text-[#4A3B32] text-center">Mes réalisations</h2>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#EFECE6] text-[#6B5B52]">
            <p className="text-lg">Le portfolio arrive bientôt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#EFECE6] overflow-hidden shadow-xs group"
              >
                <div className="aspect-square overflow-hidden bg-[#F7F4EE]">
                  <img
                    src={item.image_url}
                    alt={item.caption || "Réalisation L'Atelier Aloès"}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                {item.caption && (
                  <p className="text-sm text-[#6B5B52] px-3 py-2 text-center">{item.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appel à l'action vers le devis */}
      <div className="text-center bg-white rounded-3xl border border-[#EFECE6] shadow-xs py-10 px-6 space-y-4">
        <h3 className="text-xl font-serif font-bold text-[#4A3B32]">Un projet de personnalisation en tête ?</h3>
        <p className="text-[#6B5B52] max-w-md mx-auto">
          Parlons-en et obtenez un devis adapté à votre demande.
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
