import sql, { initDb } from '../../../../lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Yellowtail } from 'next/font/google';

const yellowtail = Yellowtail({ weight: '400', subsets: ['latin'] });

export const revalidate = 0;

function displayCell(value) {
  if (value === undefined || value === null || value.toString().trim() === '') return '—';
  return value;
}

function breakWords(text) {
  const words = text.split(' ').filter(Boolean);
  return words.map((word, i) => (
    <span key={i}>
      {word}
      {i < words.length - 1 && <br />}
    </span>
  ));
}

export default async function CategoryTarifsPage({ params }) {
  await initDb();
  const category = decodeURIComponent(params.category);
  const rows = await sql`SELECT * FROM pricing_tables WHERE category = ${category} ORDER BY position, id`;

  if (rows.length === 0) {
    notFound();
  }

  const tables = rows.map((t) => {
    let columns = [];
    let trows = [];
    try {
      columns = JSON.parse(t.columns || '[]');
    } catch {
      columns = [];
    }
    try {
      trows = JSON.parse(t.rows || '[]');
    } catch {
      trows = [];
    }
    return { ...t, columns, rows: trows };
  });

  const description = tables.find((t) => t.description && t.description.trim())?.description;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4">
      <div>
        <Link href="/personnalisation/tarifs" className="text-sm font-medium text-[#6B5B52] hover:text-[#5A3E36] transition">
          ← Toutes les catégories
        </Link>
      </div>

      <div className="bg-[#FF9CCB] rounded-3xl shadow-sm p-6 sm:p-12 space-y-10">
        <div className="text-center space-y-2">
          <h1 className={`${yellowtail.className} text-5xl sm:text-6xl text-[#5A3E36] leading-tight`}>
            {category}
          </h1>
          {description && (
            <p className="text-[#5A3E36]/90 text-sm max-w-lg mx-auto whitespace-pre-line">{description}</p>
          )}
        </div>

        <div className="space-y-10">
          {tables.map((table) => {
            if (table.rows.length === 0) {
              return table.title ? (
                <h2 key={table.id} className="text-center text-lg font-bold text-[#5A3E36]">
                  {table.title}
                </h2>
              ) : null;
            }

            // Fusionne les colonnes consécutives qui partagent le même "groupe"
            const headerGroups = [];
            for (const col of table.columns) {
              const last = headerGroups[headerGroups.length - 1];
              if (last && col.group && last.group === col.group) {
                last.cols.push(col);
              } else {
                headerGroups.push({ group: col.group || null, cols: [col] });
              }
            }
            const hasGroups = headerGroups.some((g) => g.group);
            const hasAnyLabel = table.columns.some((c) => c.label && c.label.trim());
            const showHeader = hasGroups || hasAnyLabel;

            return (
              <div key={table.id} className="space-y-3">
                {table.title && (
                  <h2 className="text-center text-lg font-bold text-[#5A3E36]">{table.title}</h2>
                )}
                <div className="overflow-x-auto">
                  <table className="mx-auto border-collapse">
                    {showHeader && (
                    <thead>
                      {hasGroups && (
                        <tr>
                          <th className={table.wrap_labels ? 'w-28 sm:w-32 px-3' : 'px-3'} />
                          <th className="border-l border-[#5A3E36]/40 px-1" />
                          {headerGroups.map((g, gi) =>
                            g.group ? (
                              <th
                                key={gi}
                                colSpan={g.cols.length}
                                className="px-4 pt-1 text-[#5A3E36] font-bold text-lg sm:text-xl leading-tight whitespace-nowrap"
                              >
                                {table.wrap_labels ? breakWords(g.group) : g.group}
                              </th>
                            ) : (
                              <th key={gi} className="px-4" />
                            )
                          )}
                        </tr>
                      )}
                      <tr>
                        <th className={table.wrap_labels ? 'w-28 sm:w-32 px-3' : 'px-3'} />
                        <th className="border-l border-[#5A3E36]/40 px-1" />
                        {headerGroups.map((g, gi) => (
                          <th
                            key={gi}
                            colSpan={g.cols.length}
                            className="px-4 pb-2 text-[#5A3E36] text-xs font-medium whitespace-nowrap"
                          >
                            {g.cols.map((c) => c.label).join(' | ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    )}
                    <tbody>
                      {table.rows.map((row, ri) => (
                        <tr key={ri}>
                          <td
                            className={
                              (table.wrap_labels ? 'w-28 sm:w-32 ' : '') +
                              'text-right px-3 py-1 text-[#5A3E36] font-bold text-base sm:text-lg leading-tight' +
                              (table.wrap_labels ? '' : ' whitespace-nowrap')
                            }
                          >
                            {table.wrap_labels ? breakWords(row.name) : row.name}
                          </td>
                          <td className="border-l border-[#5A3E36]/40 px-1" />
                          {table.columns.map((c, ci) => (
                            <td
                              key={ci}
                              className="text-center px-3 py-1 text-[#5A3E36] font-bold text-base sm:text-lg whitespace-nowrap"
                            >
                              {displayCell(row.values[ci])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <p className={`${yellowtail.className} text-3xl text-[#5A3E36]`}>l'atelier Aloès</p>
        </div>
      </div>

      <div className="text-center bg-white rounded-3xl border border-[#EFECE6] shadow-xs py-10 px-6 space-y-4">
        <h3 className="text-xl font-serif font-bold text-[#4A3B32]">Un projet en tête ?</h3>
        <p className="text-[#6B5B52] max-w-md mx-auto">
          Ces tarifs sont indicatifs — contactez-moi pour un devis adapté à votre demande.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-[#5A3E36] hover:bg-[#4A3B32] text-white font-bold px-8 py-3.5 rounded-2xl transition"
        >
          Demander un devis
        </Link>
      </div>
    </div>
  );
}
