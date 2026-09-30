// Sections du site qui ont une galerie « Mes réalisations » gérée depuis l'admin.
// Pour en ajouter une : l'ajouter ici (le slug doit correspondre au dossier dans /app).
export const GALLERY_SECTIONS = [
  { slug: 'personnalisation', label: 'Personnalisation' },
  { slug: 'bijoux', label: 'Bijoux' },
  { slug: 'aquarelle', label: 'Aquarelle' },
  { slug: 'couture', label: 'Couture' },
];

export function isGallerySection(slug) {
  return GALLERY_SECTIONS.some((s) => s.slug === slug);
}
