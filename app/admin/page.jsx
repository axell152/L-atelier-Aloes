import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import sql, { initDb } from '../../lib/db';
import { revalidatePath } from 'next/cache';
import { del, put } from '@vercel/blob';
import PricingTableEditor from '../../components/PricingTableEditor';
import PricingTableRow from '../../components/PricingTableRow';
import AddPortfolioForm from '../../components/AddPortfolioForm';

export const revalidate = 0;

export default async function AdminPage() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get('admin_auth');

  if (!isAuthenticated || isAuthenticated.value !== 'true') {
    redirect('/admin/login');
  }

  await initDb();

  async function addPricingTable(formData) {
    'use server';
    const category = formData.get('category');
    const title = formData.get('title') || null;
    const description = formData.get('description') || null;
    const wrapLabels = formData.get('wrap_labels') === 'on';
    const columns = formData.get('columns') || '[]';
    const rows = formData.get('rows') || '[]';

    const existingCategory = await sql`
      SELECT MIN(position) AS position
      FROM pricing_tables
      WHERE category = ${category}
    `;

    let position = existingCategory[0]?.position;

    if (position === null || position === undefined) {
      const lastPosition = await sql`
        SELECT COALESCE(MAX(position), -1) AS position
        FROM pricing_tables
      `;
      position = Number(lastPosition[0]?.position ?? -1) + 1;
    }

    await sql`
      INSERT INTO pricing_tables (category, title, description, columns, rows, position, wrap_labels)
      VALUES (${category}, ${title}, ${description}, ${columns}, ${rows}, ${position}, ${wrapLabels})
    `;

    revalidatePath('/personnalisation/tarifs');
    revalidatePath('/admin');
  }

  async function updatePricingTable(formData) {
    'use server';
    const id = formData.get('id');
    const category = formData.get('category');
    const title = formData.get('title') || null;
    const description = formData.get('description') || null;
    const wrapLabels = formData.get('wrap_labels') === 'on';
    const columns = formData.get('columns') || '[]';
    const rows = formData.get('rows') || '[]';

    await sql`
      UPDATE pricing_tables
      SET category = ${category}, title = ${title}, description = ${description}, columns = ${columns}, rows = ${rows}, wrap_labels = ${wrapLabels}
      WHERE id = ${id}
    `;

    revalidatePath('/personnalisation/tarifs');
    revalidatePath('/admin');
  }

  async function movePricingCategory(formData) {
    'use server';
    const category = (formData.get('category') || '').toString();
    const direction = (formData.get('direction') || '').toString();

    if (!category || !['up', 'down'].includes(direction)) return;

    // On récupère les catégories dans leur ordre actuel.
    const rows = await sql`
      SELECT category, MIN(position) AS position
      FROM pricing_tables
      GROUP BY category
      ORDER BY MIN(position), category
    `;

    const categories = rows.map((row) => row.category);
    const currentIndex = categories.indexOf(category);

    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= categories.length) return;

    // On échange les deux catégories.
    [categories[currentIndex], categories[targetIndex]] = [
      categories[targetIndex],
      categories[currentIndex],
    ];

    // On renumérote proprement toutes les catégories. Cela fonctionne même
    // si les anciennes positions étaient toutes à 0.
    for (let index = 0; index < categories.length; index++) {
      await sql`
        UPDATE pricing_tables
        SET position = ${index}
        WHERE category = ${categories[index]}
      `;
    }

    revalidatePath('/personnalisation/tarifs');
    revalidatePath('/admin');
  }

  async function deletePricingTable(formData) {
    'use server';
    const id = formData.get('id');
    await sql`DELETE FROM pricing_tables WHERE id = ${id}`;
    revalidatePath('/personnalisation/tarifs');
    revalidatePath('/admin');
  }

  async function addPortfolioItem(formData) {
    'use server';
    const caption = formData.get('caption');
    let imageUrl = '';

    try {
      const file = formData.get('image');
      if (file && file.size > 0) {
        const blob = await put(`portfolio/${crypto.randomUUID()}-${file.name}`, file, {
          access: 'public',
        });
        imageUrl = blob.url;
      }
    } catch (e) {
      console.log('Erreur upload portfolio:', e);
    }

    if (!imageUrl) return;

    await sql`INSERT INTO portfolio_items (image_url, caption) VALUES (${imageUrl}, ${caption})`;
    revalidatePath('/personnalisation');
    revalidatePath('/admin');
  }

  async function deletePortfolioItem(formData) {
    'use server';
    const id = formData.get('id');

    try {
      const [item] = await sql`SELECT image_url FROM portfolio_items WHERE id = ${id}`;
      if (item?.image_url && item.image_url.startsWith('http')) {
        await del(item.image_url).catch(() => {});
      }
    } catch (e) {
      console.log('Erreur suppression image Blob portfolio:', e);
    }

    await sql`DELETE FROM portfolio_items WHERE id = ${id}`;
    revalidatePath('/personnalisation');
    revalidatePath('/admin');
  }

  const pricingTableRows = await sql`
    SELECT * FROM pricing_tables
    ORDER BY position, category, id
  `;

  const pricingTables = pricingTableRows.map((t) => {
    let columns = [];
    let rows = [];
    try {
      columns = JSON.parse(t.columns || '[]');
    } catch {
      columns = [];
    }
    try {
      rows = JSON.parse(t.rows || '[]');
    } catch {
      rows = [];
    }
    return { ...t, columns, rows };
  });

  const categoryIndexes = new Map();
  pricingTables.forEach((table) => {
    if (!categoryIndexes.has(table.category)) {
      categoryIndexes.set(table.category, categoryIndexes.size);
    }
  });

  const portfolioItems = await sql`SELECT * FROM portfolio_items ORDER BY position, id DESC`;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#4A3B32] mb-2">Espace Administration</h1>
        <p className="text-[#6B5B52]">Gérez vos tarifs et votre portfolio.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#EFECE6] shadow-xs">
        <h2 className="text-xl font-serif font-bold text-[#4A3B32] mb-4">Créer un tableau de tarifs</h2>
        <PricingTableEditor action={addPricingTable} />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#EFECE6] shadow-xs">
        <h2 className="text-xl font-serif font-bold text-[#4A3B32] mb-4">Mes tableaux de tarifs ({pricingTables.length})</h2>
        {pricingTables.length === 0 ? (
          <p className="text-sm text-[#6B5B52]">Aucun tableau créé pour le moment.</p>
        ) : (
          <div className="divide-y divide-[#F7F4EE]">
            {pricingTables.map((table) => {
              const categoryIndex = categoryIndexes.get(table.category);
              const isFirstInCategory =
                pricingTables.findIndex((item) => item.category === table.category) ===
                pricingTables.indexOf(table);

              return (
                <PricingTableRow
                  key={table.id}
                  table={table}
                  updateAction={updatePricingTable}
                  deleteAction={deletePricingTable}
                  moveCategoryAction={movePricingCategory}
                  categoryIndex={categoryIndex}
                  categoryCount={categoryIndexes.size}
                  showCategoryControls={isFirstInCategory}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#EFECE6] shadow-xs">
        <h2 className="text-xl font-serif font-bold text-[#4A3B32] mb-4">Ajouter une photo au portfolio</h2>
        <AddPortfolioForm action={addPortfolioItem} />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#EFECE6] shadow-xs">
        <h2 className="text-xl font-serif font-bold text-[#4A3B32] mb-4">Mon portfolio ({portfolioItems.length})</h2>
        {portfolioItems.length === 0 ? (
          <p className="text-sm text-[#6B5B52]">Aucune photo ajoutée pour le moment.</p>
        ) : (
          <div className="divide-y divide-[#F7F4EE]">
            {portfolioItems.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={item.image_url} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <p className="font-semibold text-[#4A3B32] break-words">{item.caption || '(sans légende)'}</p>
                </div>
                <form action={deletePortfolioItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="px-3 py-1.5 text-xs font-medium rounded-xl bg-red-50 text-red-600 hover:bg-red-100 shrink-0">
                    Supprimer
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
