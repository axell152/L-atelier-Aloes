import SectionGalleryPage from '../../components/SectionGalleryPage';

export const revalidate = 0;
export const metadata = { title: "Bijoux | L'Atelier Aloès" };

export default function Page() {
  return <SectionGalleryPage section="bijoux" title="Bijoux" subtitle="Bijoux faits main, pièces uniques et petites séries." />;
}
