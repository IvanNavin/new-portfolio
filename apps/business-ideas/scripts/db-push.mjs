import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL відсутній у .env.local');
  process.exit(1);
}

const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS businesses (
    slug text PRIMARY KEY,
    category text NOT NULL,
    difficulty integer NOT NULL,
    risk integer NOT NULL,
    budget_min integer NOT NULL,
    budget_max integer NOT NULL,
    defaults jsonb NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    updated_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS business_content (
    slug text NOT NULL REFERENCES businesses(slug) ON DELETE CASCADE,
    locale text NOT NULL,
    name text NOT NULL,
    short_description text NOT NULL,
    description text NOT NULL,
    pros jsonb NOT NULL,
    cons jsonb NOT NULL,
    revenue_labels jsonb,
    field_overrides jsonb,
    PRIMARY KEY (slug, locale)
  )
`;

console.log('Таблиці створено ✓');
process.exit(0);
