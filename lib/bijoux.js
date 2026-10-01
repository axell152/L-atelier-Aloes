// Sous-catégories de la section Bijoux (chaque bijou a sa fiche produit).
export const JEWELRY_SUBCATEGORIES = [
  { slug: 'bracelets', label: 'Bracelets' },
  { slug: 'bracelets-de-cheville', label: 'Bracelets de cheville' },
  { slug: 'boucles-d-oreilles', label: "Boucles d'oreilles" },
  { slug: 'colliers', label: 'Colliers' },
];

export function getJewelrySubcategory(slug) {
  return JEWELRY_SUBCATEGORIES.find((s) => s.slug === slug);
}

export function parseImages(value) {
  try {
    const list = JSON.parse(value || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function formatPrice(price) {
  if (price === null || price === undefined || price === '') return null;
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(price));
}

export function parseColors(value) {
  return parseImages(value).filter((c) => typeof c === 'string' && c.trim() !== '');
}

// "Doré, Argenté, Rose" -> ["Doré", "Argenté", "Rose"] (sans doublons, 20 max)
export function splitColors(input) {
  const list = (input || '')
    .toString()
    .split(/[,;\n]/)
    .map((c) => c.trim())
    .filter(Boolean);
  return [...new Set(list)].slice(0, 20);
}
