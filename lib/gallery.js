// Sections du site qui ont une galerie « Mes réalisations » gérée depuis l'admin.
// Pour en ajouter une : l'ajouter ici (le slug doit correspondre au dossier dans /app).
// `subcategories` (optionnel) : sous-catégories, chacune avec sa propre page /section/slug.
export const GALLERY_SECTIONS = [
  { slug: 'personnalisation', label: 'Personnalisation' },
  {
    slug: 'bijoux',
    label: 'Bijoux',
    subcategories: [
      { slug: 'bracelets', label: 'Bracelets' },
      { slug: 'bracelets-de-cheville', label: 'Bracelets de cheville' },
      { slug: 'boucles-d-oreilles', label: "Boucles d'oreilles" },
      { slug: 'colliers', label: 'Colliers' },
    ],
  },
  { slug: 'aquarelle', label: 'Aquarelle' },
  { slug: 'couture', label: 'Couture' },
];

export function isGallerySection(slug) {
  return GALLERY_SECTIONS.some((s) => s.slug === slug);
}

export function getSubcategories(sectionSlug) {
  return GALLERY_SECTIONS.find((s) => s.slug === sectionSlug)?.subcategories || [];
}

export function isSubcategory(sectionSlug, subSlug) {
  return getSubcategories(sectionSlug).some((s) => s.slug === subSlug);
}
