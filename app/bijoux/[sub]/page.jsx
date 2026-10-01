import Link from 'next/link';
import { notFound } from 'next/navigation';
import sql, { initDb } from '../../../lib/db';
import { getJewelrySubcategory, parseImages, formatPrice } from '../../../lib/bijoux';
import { optimizeImage } from '../../../lib/images';

export const revalidate = 0;

export function generateMetadata({ params }) {
  const sc = getJewelrySubcategory(params.sub);
  return { title: `${sc ? sc.label : 'Bijoux'} | L'Atelier Aloès` };
}

export default async function BijouxSubPage({ params }) {
  const sc = getJewelrySubcategory(params.sub);
  if (!sc) notFound();

  await initDb();
  const items = await sql`
    SELECT * FROM jewelry_items
    WHERE subcategory = ${sc.slug}
    ORDER BY is_available DESC, id DESC
  `;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4">
      <Link href="/bijoux" className="inline-block text-sm font-medium text-[#6B5B52] hover:text-[#5A3E36] transition">
        ← Tous les bijoux
      </Link>

      <div className="text-center space-y-3 py-8 bg-white rounded-3xl border border-[#EFECE6] shadow-xs px-6">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#4A3B32]">{sc.label}</h1>
        <p className="text-[#6B5B52]">Bijoux faits main</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#EFECE6] text-[#6B5B52]">
          <p className="text-lg">Les créations arrivent bientôt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => {
            const cover = parseImages(item.images)[0];
            const price = formatPrice(item.price);
            return (
              <Link
                key={item.id}
                href={`/bijoux/${sc.slug}/${item.id}`}
                className="bg-white rounded-3xl border border-[#EFECE6] overflow-hidden shadow-xs hover:shadow-md transition group"
              >
                <div className="aspect-square overflow-hidden bg-[#F7F4EE] relative">
                  {cover && (
                    <img
                      src={optimizeImage(cover, 800)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  )}
                  {!item.is_available && (
                    <span className="absolute top-3 left-3 text-xs font-semibold bg-white/90 text-[#5A3E36] px-3 py-1 rounded-full">
                      Indisponible
                    </span>
                  )}
                </div>
                <div className="px-4 py-3 space-y-0.5">
                  <p className="font-serif font-bold text-[#4A3B32]">{item.name}</p>
                  <p className="text-sm text-[#6B5B52]">{price || 'Prix sur demande'}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
