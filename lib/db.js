import postgres from 'postgres';

// prepare: false désactive les prepared statements. Sur Neon (comme sur tout pooler
// de type PgBouncer en mode transaction), une connexion réutilisée entre deux
// invocations serverless peut garder en cache un plan de requête devenu invalide
// dès que le schéma de la table change (ALTER TABLE), d'où l'erreur
// "cached plan must not change result type".
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      category TEXT,
      description TEXT,
      image_url TEXT,
      extra_images TEXT,
      is_hidden BOOLEAN DEFAULT false
    );
  `;

  // Rattrape les colonnes manquantes si la table existait déjà avec un schéma plus ancien
  // (CREATE TABLE IF NOT EXISTS ne modifie jamais une table déjà existante).
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS extra_images TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false`;

  await sql`
    CREATE TABLE IF NOT EXISTS pricing_items (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      options TEXT NOT NULL DEFAULT '[]',
      position INT DEFAULT 0
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_items (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      caption TEXT,
      position INT DEFAULT 0
    );
  `;

  // Section du site à laquelle appartient la photo (personnalisation, bijoux, aquarelle, couture).
  // Les photos existantes restent dans « personnalisation » grâce à la valeur par défaut.
  await sql`ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'personnalisation'`;
  // Sous-catégorie (ex. bijoux > colliers). Vide pour les sections sans sous-catégories.
  await sql`ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS subcategory TEXT`;

  // Fiches produits des bijoux. `images` = liste JSON d'adresses (la première est la photo principale).
  // price vide = « prix sur demande ».
  await sql`
    CREATE TABLE IF NOT EXISTS jewelry_items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      price DECIMAL(10,2),
      materials TEXT,
      description TEXT,
      images TEXT NOT NULL DEFAULT '[]',
      is_available BOOLEAN DEFAULT true,
      position INT DEFAULT 0
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pricing_tables (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT,
      description TEXT,
      columns TEXT NOT NULL DEFAULT '[]',
      rows TEXT NOT NULL DEFAULT '[]',
      position INT DEFAULT 0,
      wrap_labels BOOLEAN DEFAULT false
    );
  `;
  await sql`ALTER TABLE pricing_tables ADD COLUMN IF NOT EXISTS wrap_labels BOOLEAN DEFAULT false`;
}

export default sql;
