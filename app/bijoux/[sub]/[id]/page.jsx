import Link from 'next/link';
import { notFound } from 'next/navigation';
import sql, { initDb } from '../../../../lib/db';
import { getJewelrySubcategory, parseImages, formatPrice } from '../../../../lib/bijoux';
import { WHATSAPP_NUMBER } from '../../../../lib/site';
import ProductGallery from '../../../../components/ProductGallery';

export const revalidate = 0;

async function getItem(sub, idParam) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  await initDb();
  const [item] = await sql`SELECT * FROM jewelry_items WHERE id = ${id} AND subcategory = ${sub}`;
  return item || null;
}

export async function generateMetadata({ params }) {
  const item = await getItem(params.sub, params.id);
  return { title: `${item ? item.name : 'Bijou'} | L'Atelier Aloès` };
}

export default async function JewelryPage({ params }) {
  const sc = getJewelrySubcategory(params.sub);
  if (!sc) notFound();
  const item = await getItem(sc.slug, params.id);
  if (!item) notFound();

  const images = parseImages(item.images);
  const price = formatPrice(item.price);
  const message = `Bonjour, je suis intéressé(e) par le bijou « ${item.name} » (${sc.label}).`;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 space-y-8">
      <Link href={`/bijoux/${sc.slug}`} className="inline-block text-sm font-medium text-[#6B5B52] hover:text-[#5A3E36] transition">
        ← {sc.label}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <ProductGallery images={images} name={item.name} />

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-wider uppercase bg-[#FF9CCB]/30 text-[#5A3E36] px-3 py-1 rounded-full">
              {sc.label}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#4A3B32]">{item.name}</h1>
            <p className="text-2xl font-semibold text-[#5A3E36]">{price || 'Prix sur demande'}</p>
            {!item.is_available && (
              <p className="text-sm font-semibold text-[#6B5B52]">Ce bijou n'est plus disponible.</p>
            )}
          </div>

          {item.materials && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B52] mb-1">Matières</h2>
              <p className="text-[#4A3B32]">{item.materials}</p>
            </div>
          )}

          {item.description && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B52] mb-1">Description</h2>
              <p className="text-[#4A3B32] whitespace-pre-line">{item.description}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center bg-[#5A3E36] hover:bg-[#4A3B32] text-white font-bold px-8 py-3.5 rounded-2xl transition"
            >
              {item.is_available ? 'Commander sur WhatsApp' : 'Demander un bijou similaire'}
            </a>
            <Link
              href="/contact"
              className="text-center bg-white border border-[#EFECE6] hover:border-[#5A3E36] text-[#4A3B32] font-semibold px-8 py-3.5 rounded-2xl transition"
            >
              Me contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
