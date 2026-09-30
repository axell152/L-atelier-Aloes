import SectionGalleryPage from '../../components/SectionGalleryPage';

export const revalidate = 0;
export const metadata = { title: "Aquarelle | L'Atelier Aloès" };

export default function Page() {
  return <SectionGalleryPage section="aquarelle" title="Aquarelle" subtitle="Peintures et illustrations à l’aquarelle." />;
}
