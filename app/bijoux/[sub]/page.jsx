import { notFound } from 'next/navigation';
import SectionGalleryPage from '../../../components/SectionGalleryPage';
import { getSubcategories } from '../../../lib/gallery';

export const revalidate = 0;

export function generateMetadata({ params }) {
  const sc = getSubcategories('bijoux').find((s) => s.slug === params.sub);
  return { title: `${sc ? sc.label : 'Bijoux'} | L'Atelier Aloès` };
}

export default function BijouxSubPage({ params }) {
  const sc = getSubcategories('bijoux').find((s) => s.slug === params.sub);
  if (!sc) notFound();

  return (
    <SectionGalleryPage
      section="bijoux"
      subcategory={sc.slug}
      title={sc.label}
      subtitle="Bijoux faits main"
      backHref="/bijoux"
      backLabel="Tous les bijoux"
    />
  );
}
