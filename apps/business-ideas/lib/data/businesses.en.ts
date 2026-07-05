import { businesses } from "@/lib/data/businesses";
import type { Business, RevenueFieldLabels } from "@/lib/types";

/** Тільки перекладний текст бізнесу — числа беруться з базового масиву */
type BusinessText = Pick<
  Business,
  "name" | "shortDescription" | "description" | "pros" | "cons"
> & {
  revenueLabels?: RevenueFieldLabels;
  fieldOverrides?: Business["fieldOverrides"];
};

const EN_TEXT: Record<string, BusinessText> = {
  "coffee-shop": {
    name: "Coffee shop",
    shortDescription:
      "A stationary coffee shop with 15–25 seats in a residential area or near offices.",
    description:
      "A classic sit-in coffee shop. The core revenue is takeaway coffee and desserts. Success depends heavily on location and consistent product quality.",
    pros: [
      "Steady daily demand for coffee",
      "High margin on drinks (60–70%)",
      "Regular customers and predictable revenue",
      "Can be scaled into a chain",
    ],
    cons: [
      "Success critically depends on location",
      "High competition in cities",
      "Expensive fit-out and equipment upfront",
      "Requires constant quality and staff control",
    ],
  },
  "mobile-coffee": {
    name: "Mobile coffee",
    shortDescription:
      "A coffee trailer or kiosk in a busy spot. Minimal fit-out, quick start.",
    description:
      "Takeaway coffee from a mobile point: a trailer, coffee van or small kiosk. Much cheaper to start than a stationary café, with the option to relocate if a spot underperforms.",
    pros: [
      "Low barrier to entry",
      "You can move to a better location",
      "Fast payback with a good spot",
      "Minimal staff — you can work it yourself",
    ],
    cons: [
      "Seasonality and weather dependence",
      "Limited menu and revenue of a single point",
      "Placement permit issues",
      "Hard to build a brand from one point",
    ],
  },
  "car-wash": {
    name: "Car wash",
    shortDescription:
      "A 2–4 bay self-service wash. Capital-intensive to launch, but minimal staff and steady demand.",
    description:
      "A self-service car wash: the customer washes their own car at an equipped bay. Large investment into equipment and site prep, but almost no staff, runs around the clock and has clear per-bay unit economics.",
    pros: [
      "Steady demand regardless of trends",
      "Self-service washes need almost no staff",
      "Long equipment life cycle",
      "Add-on services: detailing, polishing",
    ],
    cons: [
      "Large capital investment upfront",
      "Long payback (1.5–3 years)",
      "Dependence on season and weather",
      "Strict requirements for the site and utilities",
    ],
    fieldOverrides: {
      startup: {
        renovation: {
          label: "Site construction",
          hint: "Concrete, drainage, water treatment & recycling, electrics, canopy.",
        },
        initialStock: {
          label: "Chemicals & consumables",
          hint: "Initial supply of shampoo, foam, wax, microfiber, brushes.",
        },
        furniture: {
          hint: "Technical room, operator station and a payment terminal.",
        },
      },
      monthly: {
        salaries: {
          hint: "Self-service runs with almost no staff: a part-time operator/cleaner.",
        },
        utilities: {
          hint: "The main line item: a wash uses a lot of water and power.",
        },
        software: {
          hint: "POS/payment terminal, loyalty app — usually minor.",
        },
      },
    },
  },
  pizzeria: {
    name: "Pizzeria",
    shortDescription:
      "A pizzeria with a dining room and delivery. High average check and a large market.",
    description:
      'A "dine-in + delivery" pizzeria. Pizza is one of the most popular food-delivery categories, with a high check and good margin, but also serious competition from chains.',
    pros: [
      "Large and steady delivery market",
      "High average check",
      "Scales well (dark kitchen, franchise)",
      "Ingredients with a long shelf life",
    ],
    cons: [
      "Competition with large chains",
      "Needs an experienced pizzaiolo and recipes",
      "Large payroll",
      "Dependence on delivery aggregators and their fees",
    ],
  },
  vending: {
    name: "Vending machines",
    shortDescription:
      "A network of 3–5 coffee or snack machines in high-traffic locations.",
    description:
      "A passive format: machines sell coffee or snacks 24/7. The key is securing good locations and servicing the machines regularly. Easy to grow the network step by step.",
    pros: [
      "Minimal staff — a few hours of an operator is enough",
      "Runs 24/7 with no days off",
      "Grow the network one machine at a time",
      "No premises fit-out needed",
    ],
    cons: [
      "Revenue of a single point is small",
      "Vandalism and breakdowns",
      "The best locations are taken or expensive",
      "Requires regular cash collection and restocking",
    ],
    revenueLabels: {
      clientsPerDay: "Sales per day (all machines)",
    },
  },
  "etsy-shop": {
    name: "Etsy shop",
    shortDescription:
      "Selling handmade or digital goods on Etsy to a global market.",
    description:
      "An Etsy shop: handmade, vintage or digital goods (prints, templates). Currency income, a global audience and minimal upfront cost — but high dependence on the platform algorithms.",
    pros: [
      "Income in foreign currency, a global market",
      "Minimal upfront investment",
      "Can start as a side gig with no office",
      "Digital goods sell with no cost of goods",
    ],
    cons: [
      "Dependence on Etsy algorithms and rules",
      "Platform and payment fees",
      "Slow ramp-up without reviews",
      "Cross-border logistics and returns",
    ],
    revenueLabels: {
      clientsPerDay: "Orders per day",
      averageCheck: "Average order value (₴)",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "Solo format: hired labour = 0, your income is the net profit. Add a helper/packing cost if needed.",
        },
      },
    },
  },
  "youtube-channel": {
    name: "YouTube channel",
    shortDescription:
      "A content business: income from monetization, integrations and own products.",
    description:
      "A YouTube channel as a business: investment into gear and a team, income from view monetization, sponsored integrations and later your own products. The riskiest part is guessing the niche and format.",
    pros: [
      "Minimal fixed costs",
      "The channel is an asset that accumulates an audience",
      "Several income streams: ads, integrations, products",
      "Not tied to a location",
    ],
    cons: [
      "Unpredictable income, especially the first year",
      "Full dependence on platform algorithms",
      "Fierce competition for attention",
      "Burnout: content is needed constantly",
    ],
    revenueLabels: {
      clientsPerDay: "Thousands of views per day",
      averageCheck: "Revenue per 1000 views: ads + sponsorships (₴)",
    },
  },
  saas: {
    name: "SaaS",
    shortDescription:
      "A niche subscription web service. Long ramp-up, but the best scalability.",
    description:
      "Software as a Service: a niche product on a monthly subscription. The main investment is building the MVP and marketing. The figures show a steady state (a stable subscriber base, MRR) reached in 12–18 months — and ~40% of micro-SaaS never hit $1K MRR. The income is recurring and almost without marginal costs.",
    pros: [
      "Recurring revenue (subscriptions)",
      "Margins of 80–90%",
      "Scales without a proportional rise in costs",
      "A global market from day one",
    ],
    cons: [
      "A long road to the first customers",
      "Expensive development and support",
      "High product mortality at the start",
      "Needs skills in both product and marketing",
    ],
    revenueLabels: {
      clientsPerDay: "New subscriptions per day",
      averageCheck: "Monthly subscription (₴)",
    },
    fieldOverrides: {
      startup: {
        other: {
          label: "MVP development",
          hint: "Building the first working version — the main launch cost.",
        },
      },
      monthly: {
        salaries: {
          hint: "Bootstrapped model: the founder codes it themselves, hired team is minimal — this is really a salary to yourself/a contractor.",
        },
      },
    },
  },
  "3d-printing": {
    name: "3D printing",
    shortDescription:
      "A 3D printing studio: prototypes, custom parts, small runs to order.",
    description:
      "A 3D printing workshop with a fleet of 3–5 printers: printing prototypes, spare parts, decor and small runs. Small start and flexibility, but you have to hunt for demand yourself.",
    pros: [
      "Small upfront investment",
      "Can start at home with no rent",
      "A growing market for custom products",
      "Printers run almost unattended",
    ],
    cons: [
      "Demand has to be actively generated",
      "Long print times limit throughput",
      "Competition with cheap mass production",
      "Technical failures and material defects",
    ],
    revenueLabels: {
      clientsPerDay: "Orders per day",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "An owner-operated model: hired labour is minimal. Profit hinges on keeping the printer fleet busy, not on the number of machines.",
        },
      },
    },
  },
  "cleaning-company": {
    name: "Cleaning company",
    shortDescription:
      "Cleaning apartments and offices. Low barrier to entry, fast payback.",
    description:
      "Cleaning for apartments, offices and after renovations. You can start with two cleaners and basic equipment; the key is a steady flow of orders and quality control.",
    pros: [
      "Low barrier to entry",
      "Fast payback",
      "Recurring orders (subscriptions)",
      "B2B contracts give steady income",
    ],
    cons: [
      "High staff turnover",
      "Hard to control quality on site",
      "Price dumping by private cleaners",
      "Logistics of crews across the city",
    ],
    revenueLabels: {
      clientsPerDay: "Cleanings per day",
      averageCheck: "Average cleaning check (₴)",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "≈2 cleaners + a part-time coordinator. With per-job pay part of this shifts into cost of goods (lower margin).",
        },
        other: {
          hint: "Fuel and crew logistics across the city — a must-have line for on-site cleaning.",
        },
      },
    },
  },
};

export const businessesEn: Business[] = businesses.map((business) => ({
  ...business,
  ...EN_TEXT[business.slug],
}));
