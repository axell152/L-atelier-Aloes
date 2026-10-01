import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import sql, { initDb } from '../../../lib/db';
import { uploadImage, deleteImage } from '../../../lib/cloudinary';
import { optimizeImage } from '../../../lib/images';
import { JEWELRY_SUBCATEGORIES, getJewelrySubcategory, parseImages, parseColors, parseImageColors, splitColors, formatPrice } from '../../../lib/bijoux';
import AddJewelryForm from '../../../components/AddJewelryForm';
import JewelryImageUploader from '../../../components/JewelryImageUploader';

export const revalidate = 0;

const field =
  'w-full border border-[#EFECE6] rounded-2xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3E36]';

function parsePrice(value) {
  const cleaned = (value || '').toString().replace(/\s/g, '').replace(',', '.').replace('€', '');
  if (cleaned === '') return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function refresh(subcategory, id) {
  revalidatePath('/bijoux');
  if (subcategory) revalidatePath(`/bijoux/${subcategory}`);
  if (subcategory && id) revalidatePath(`/bijoux/${subcategory}/${id}`);
  revalidatePath('/admin/bijoux');
}

export default async function AdminBijouxPage() {
  const isAuthenticated = cookies().get('admin_auth');
  if (!isAuthenticated || isAuthenticated.value !== 'true') {
    redirect('/admin/login');
  }

  await initDb();

  async function createJewelry(formData) {
    'use server';
    const name = (formData.get('name') || '').toString().trim();
    const subcategory = (formData.get('subcategory') || '').toString();
    if (!name) return { error: 'Le nom est obligatoire.' };
    if (!getJewelrySubcategory(subcategory)) return { error: 'Choisis une sous-catégorie.' };

    const price = parsePrice(formData.get('price'));
    const materials = (formData.get('materials') || '').toString().trim() || null;
    const description = (formData.get('description') || '').toString().trim() || null;
    const isAvailable = formData.get('is_available') === 'on';
    const colors = JSON.stringify(splitColors(formData.get('colors')));

    try {
      const [row] = await sql`
        INSERT INTO jewelry_items (name, subcategory, price, materials, description, is_available, colors)
        VALUES (${name}, ${subcategory}, ${price}, ${materials}, ${description}, ${isAvailable}, ${colors})
        RETURNING id
      `;
      refresh(subcategory);
      return { id: row.id };
    } catch (e) {
      console.log('Erreur création bijou:', e);
      return { error: 'Impossible de créer la fiche.' };
    }
  }

  async function addJewelryImage(formData) {
    'use server';
    const id = Number(formData.get('productId'));
    const file = formData.get('image');
    if (!id || !file || file.size === 0) return { error: 'Photo manquante.' };

    try {
      const url = await uploadImage(file, 'bijoux');
      const [item] = await sql`SELECT images, subcategory FROM jewelry_items WHERE id = ${id}`;
      if (!item) return { error: 'Bijou introuvable.' };
      const images = [...parseImages(item.images), url];
      await sql`UPDATE jewelry_items SET images = ${JSON.stringify(images)} WHERE id = ${id}`;
      refresh(item.subcategory, id);
      return { ok: true };
    } catch (e) {
      console.log('Erreur upload bijou:', e);
      return { error: e.message || "L'envoi de la photo a échoué." };
    }
  }

  async function updateJewelry(formData) {
    'use server';
    const id = Number(formData.get('id'));
    const name = (formData.get('name') || '').toString().trim();
    const subcategory = (formData.get('subcategory') || '').toString();
    if (!id || !name || !getJewelrySubcategory(subcategory)) return;

    const price = parsePrice(formData.get('price'));
    const materials = (formData.get('materials') || '').toString().trim() || null;
    const description = (formData.get('description') || '').toString().trim() || null;
    const isAvailable = formData.get('is_available') === 'on';
    const colors = JSON.stringify(splitColors(formData.get('colors')));

    const [before] = await sql`SELECT subcategory, image_colors FROM jewelry_items WHERE id = ${id}`;
    // On garde seulement les associations photo -> couleur dont la couleur existe encore
    const keptColors = splitColors(formData.get('colors'));
    const imageColors = Object.fromEntries(
      Object.entries(parseImageColors(before?.image_colors)).filter(([, c]) => keptColors.includes(c))
    );
    await sql`
      UPDATE jewelry_items
      SET name = ${name}, subcategory = ${subcategory}, price = ${price},
          materials = ${materials}, description = ${description}, is_available = ${isAvailable},
          colors = ${colors},
          image_colors = ${JSON.stringify(imageColors)}
      WHERE id = ${id}
    `;
    if (before?.subcategory && before.subcategory !== subcategory) refresh(before.subcategory, id);
    refresh(subcategory, id);
  }

  async function deleteJewelry(formData) {
    'use server';
    const id = Number(formData.get('id'));
    const [item] = await sql`SELECT images, subcategory FROM jewelry_items WHERE id = ${id}`;
    if (!item) return;
    for (const url of parseImages(item.images)) {
      await deleteImage(url).catch(() => {});
    }
    await sql`DELETE FROM jewelry_items WHERE id = ${id}`;
    refresh(item.subcategory, id);
  }

  async function removeJewelryImage(formData) {
    'use server';
    const id = Number(formData.get('id'));
    const url = (formData.get('url') || '').toString();
    const [item] = await sql`SELECT images, image_colors, subcategory FROM jewelry_items WHERE id = ${id}`;
    if (!item) return;
    const images = parseImages(item.images).filter((u) => u !== url);
    const imageColors = parseImageColors(item.image_colors);
    delete imageColors[url];
    await sql`UPDATE jewelry_items SET images = ${JSON.stringify(images)}, image_colors = ${JSON.stringify(imageColors)} WHERE id = ${id}`;
    await deleteImage(url).catch(() => {});
    refresh(item.subcategory, id);
  }

  async function setImageColor(formData) {
    'use server';
    const id = Number(formData.get('id'));
    const url = (formData.get('url') || '').toString();
    const color = (formData.get('color') || '').toString();
    const [item] = await sql`SELECT images, colors, image_colors, subcategory FROM jewelry_items WHERE id = ${id}`;
    if (!item || !parseImages(item.images).includes(url)) return;
    const imageColors = parseImageColors(item.image_colors);
    if (color && parseColors(item.colors).includes(color)) imageColors[url] = color;
    else delete imageColors[url];
    await sql`UPDATE jewelry_items SET image_colors = ${JSON.stringify(imageColors)} WHERE id = ${id}`;
    refresh(item.subcategory, id);
  }

  async function setMainImage(formData) {
    'use server';
    const id = Number(formData.get('id'));
    const url = (formData.get('url') || '').toString();
    const [item] = await sql`SELECT images, subcategory FROM jewelry_items WHERE id = ${id}`;
    if (!item) return;
    const images = parseImages(item.images);
    if (!images.includes(url)) return;
    const reordered = [url, ...images.filter((u) => u !== url)];
    await sql`UPDATE jewelry_items SET images = ${JSON.stringify(reordered)} WHERE id = ${id}`;
    refresh(item.subcategory, id);
  }

  const items = await sql`SELECT * FROM jewelry_items ORDER BY id DESC`;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4">
      <div>
        <Link href="/admin" className="text-sm text-[#6B5B52] hover:underline mb-3 inline-block">
          ← Retour à l'administration
        </Link>
        <h1 className="text-3xl font-serif font-bold text-[#4A3B32] mb-2">Bijoux</h1>
        <p className="text-[#6B5B52]">Une fiche par bijou : photos, prix, description, disponibilité.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#EFECE6] shadow-xs">
        <h2 className="text-xl font-serif font-bold text-[#4A3B32] mb-4">Ajouter un bijou</h2>
        <AddJewelryForm
          createAction={createJewelry}
          imageAction={addJewelryImage}
          subcategories={JEWELRY_SUBCATEGORIES}
        />
      </div>

      {JEWELRY_SUBCATEGORIES.map((sc) => {
        const list = items.filter((item) => item.subcategory === sc.slug);
        return (
          <div key={sc.slug} className="bg-white p-6 rounded-3xl border border-[#EFECE6] shadow-xs">
            <h2 className="text-xl font-serif font-bold text-[#4A3B32] mb-4">
              {sc.label} ({list.length})
            </h2>
            {list.length === 0 ? (
              <p className="text-sm text-[#6B5B52]">Aucun bijou pour le moment.</p>
            ) : (
              <div className="space-y-6">
                {list.map((item) => {
                  const images = parseImages(item.images);
                  const itemColors = parseColors(item.colors);
                  const itemImageColors = parseImageColors(item.image_colors);
                  const price = formatPrice(item.price);
                  return (
                    <div key={item.id} className="border border-[#EFECE6] rounded-2xl p-4 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4 min-w-0">
                          {images[0] ? (
                            <img src={optimizeImage(images[0], 150)} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-[#F7F4EE] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-[#4A3B32] break-words">{item.name}</p>
                            <p className="text-sm text-[#6B5B52]">
                              {price || 'Prix sur demande'} · {item.is_available ? 'Disponible' : 'Indisponible'} · {images.length} photo(s)
                              {parseColors(item.colors).length > 0 && ` · ${parseColors(item.colors).length} couleur(s)`}
                            </p>
                            <Link
                              href={`/bijoux/${item.subcategory}/${item.id}`}
                              target="_blank"
                              className="text-xs text-[#5A3E36] underline"
                            >
                              Voir la fiche
                            </Link>
                          </div>
                        </div>
                        <form action={deleteJewelry}>
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className="px-3 py-1.5 text-xs font-medium rounded-xl bg-red-50 text-red-600 hover:bg-red-100 shrink-0">
                            Supprimer
                          </button>
                        </form>
                      </div>

                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {images.map((url, i) => (
                            <div key={url} className="w-24 space-y-1">
                              <img src={optimizeImage(url, 200)} alt="" className="w-24 h-24 rounded-xl object-cover" />
                              <div className="flex flex-col gap-1">
                                {itemColors.length > 0 && (
                                  <form action={setImageColor} className="flex gap-1">
                                    <input type="hidden" name="id" value={item.id} />
                                    <input type="hidden" name="url" value={url} />
                                    <select
                                      name="color"
                                      defaultValue={itemImageColors[url] || ''}
                                      className="w-full min-w-0 text-[10px] border border-[#EFECE6] rounded-lg bg-white px-1 py-1"
                                    >
                                      <option value="">Sans couleur</option>
                                      {itemColors.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                      ))}
                                    </select>
                                    <button type="submit" className="text-[10px] rounded-lg bg-[#5A3E36] text-white px-2 shrink-0">OK</button>
                                  </form>
                                )}
                                {i === 0 ? (
                                  <span className="text-[10px] text-center font-semibold text-[#5A3E36]">Photo principale</span>
                                ) : (
                                  <form action={setMainImage}>
                                    <input type="hidden" name="id" value={item.id} />
                                    <input type="hidden" name="url" value={url} />
                                    <button type="submit" className="w-full text-[10px] rounded-lg bg-[#F7F4EE] hover:bg-[#EFECE6] py-1 text-[#4A3B32]">
                                      Mettre en principale
                                    </button>
                                  </form>
                                )}
                                <form action={removeJewelryImage}>
                                  <input type="hidden" name="id" value={item.id} />
                                  <input type="hidden" name="url" value={url} />
                                  <button type="submit" className="w-full text-[10px] rounded-lg bg-red-50 hover:bg-red-100 py-1 text-red-600">
                                    Retirer
                                  </button>
                                </form>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-[#5A3E36]">Modifier la fiche / ajouter des photos</summary>
                        <div className="mt-4 space-y-5">
                          <form action={updateJewelry} className="space-y-3">
                            <input type="hidden" name="id" value={item.id} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input required name="name" defaultValue={item.name} className={field} placeholder="Nom" />
                              <select name="subcategory" defaultValue={item.subcategory} className={field}>
                                {JEWELRY_SUBCATEGORIES.map((s) => (
                                  <option key={s.slug} value={s.slug}>{s.label}</option>
                                ))}
                              </select>
                              <input name="price" defaultValue={item.price ?? ''} inputMode="decimal" className={field} placeholder="Prix en € (vide = sur demande)" />
                              <input name="materials" defaultValue={item.materials ?? ''} className={field} placeholder="Matières" />
                            </div>
                            <input
                              name="colors"
                              defaultValue={parseColors(item.colors).join(', ')}
                              className={field}
                              placeholder="Couleurs proposées, séparées par des virgules"
                            />
                            <textarea name="description" rows={3} defaultValue={item.description ?? ''} className={field} placeholder="Description" />
                            <label className="flex items-center gap-2 text-sm text-[#4A3B32]">
                              <input type="checkbox" name="is_available" defaultChecked={item.is_available} className="w-4 h-4 accent-[#5A3E36]" />
                              Disponible
                            </label>
                            <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#5A3E36] text-white hover:bg-[#4A3B32]">
                              Enregistrer les modifications
                            </button>
                          </form>
                          <div className="border-t border-[#EFECE6] pt-4">
                            <p className="text-sm font-medium text-[#6B5B52] mb-2">Ajouter des photos</p>
                            <JewelryImageUploader productId={item.id} action={addJewelryImage} />
                          </div>
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
