import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

import { businesses } from "@/lib/data/businesses";
import { businessesEn } from "@/lib/data/businesses.en";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL відсутній у .env.local");
  process.exit(1);
}

const sql = neon(url);

/**
 * Пересіває БД з вбудованих TS-даних: перезаписує рядки businesses і
 * business_content (uk/en). Ручні правки через адмінку буде перезаписано —
 * TS лишається джерелом правди для базового набору.
 */
async function seed() {
  for (let i = 0; i < businesses.length; i += 1) {
    const uk = businesses[i];
    const en = businessesEn[i];

    await sql`
    INSERT INTO businesses
      (slug, category, difficulty, risk, budget_min, budget_max, defaults, sort_order, updated_at)
    VALUES
      (${uk.slug}, ${uk.category}, ${uk.difficulty}, ${uk.risk},
       ${uk.recommendedBudget.min}, ${uk.recommendedBudget.max},
       ${JSON.stringify(uk.defaults)}, ${i}, now())
    ON CONFLICT (slug) DO UPDATE SET
      category = EXCLUDED.category,
      difficulty = EXCLUDED.difficulty,
      risk = EXCLUDED.risk,
      budget_min = EXCLUDED.budget_min,
      budget_max = EXCLUDED.budget_max,
      defaults = EXCLUDED.defaults,
      sort_order = EXCLUDED.sort_order,
      updated_at = now()
  `;

    const rows = [
      { locale: "uk", data: uk },
      { locale: "en", data: en },
    ];

    for (const { locale, data } of rows) {
      await sql`
      INSERT INTO business_content
        (slug, locale, name, short_description, description, pros, cons, revenue_labels, field_overrides)
      VALUES
        (${uk.slug}, ${locale}, ${data.name}, ${data.shortDescription},
         ${data.description}, ${JSON.stringify(data.pros)}, ${JSON.stringify(data.cons)},
         ${data.revenueLabels ? JSON.stringify(data.revenueLabels) : null},
         ${data.fieldOverrides ? JSON.stringify(data.fieldOverrides) : null})
      ON CONFLICT (slug, locale) DO UPDATE SET
        name = EXCLUDED.name,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        pros = EXCLUDED.pros,
        cons = EXCLUDED.cons,
        revenue_labels = EXCLUDED.revenue_labels,
        field_overrides = EXCLUDED.field_overrides
    `;
    }

    console.log(`✓ ${uk.slug}`);
  }

  console.log(`Пересіяно ${businesses.length} бізнесів ✓`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
