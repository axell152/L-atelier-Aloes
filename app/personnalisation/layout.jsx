import SectionSubNav from '../../components/SectionSubNav';

export const metadata = {
  title: "Personnalisation | L'Atelier Aloès",
  description: 'Stickers, T-shirts, mugs et personnalisations uniques faites main.',
};

export default function PersonnalisationLayout({ children }) {
  return (
    <>
      <SectionSubNav
        title="Personnalisation"
        items={[
          { href: '/personnalisation', label: 'Réalisations', exact: true },
          { href: '/personnalisation/tarifs', label: 'Tarifs' },
        ]}
      />
      {children}
    </>
  );
}
