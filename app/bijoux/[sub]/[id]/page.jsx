import Link from 'next/link';
import { notFound } from 'next/navigation';
import sql, { initDb } from '../../../../lib/db';
import { getJewelrySubcategory, parseImages, parseColors, formatPrice } from '../../../../lib/bijoux';
import { WHATSAPP_NUMBER } from '../../../../lib/site';
import ProductGallery from '../../../../components/ProductGallery';
import ProductOrder from '../../../../components/ProductOrder';

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
  const colors = parseColors(item.colors);

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

          <ProductOrder
            name={item.name}
            categoryLabel={sc.label}
            colors={colors}
            available={item.is_available}
            whatsappNumber={WHATSAPP_NUMBER}
          />
        </div>
      </div>
    </div>
  );
}
