import SectionGalleryPage from '../../components/SectionGalleryPage';

export const revalidate = 0;
export const metadata = { title: "Couture | L'Atelier Aloès" };

export default function Page() {
  return <SectionGalleryPage section="couture" title="Couture" subtitle="Créations textiles et couture artisanale." />;
}
