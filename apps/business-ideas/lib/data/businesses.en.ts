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
  barbershop: {
    name: "Barbershop",
    shortDescription:
      "A 3-chair men's grooming salon in a residential district with a recurring client base.",
    description:
      "A 2–3 chair barbershop of ~40 m² in a residential district of Kyiv or a mid-size city. Barbers earn ~40% commission per service, so payroll scales with revenue. Clients return every 3–5 weeks, creating predictable recurring income.",
    pros: [
      "Recurring demand — clients return monthly",
      "Payroll scales with revenue (commission-based barbers)",
      "Fast payback of 9–14 months per market data",
      "No licenses needed, simple sole-proprietor setup",
    ],
    cons: [
      "High competition — barbershops in every district",
      "Business depends on barbers: if they leave, clients follow",
      "First 3–4 months near break-even while building the base",
      "Revenue capped by chairs and working hours",
    ],
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "Barbers earn ~40% commission per check — already reflected in the margin; this line covers only the administrator and cleaning.",
        },
      },
    },
  },
  "nail-studio": {
    name: "Nail studio",
    shortDescription:
      "A 3-station nail studio with technicians paid a percentage of each service.",
    description:
      "A compact manicure and pedicure studio with 3 workstations in a ~35–40 m² space. Technicians earn 40% of each ticket, so payroll scales automatically with revenue and does not strain cash flow in slow months. Demand is recurring: a client returns every 3–4 weeks, so a base of ~150 regulars fully books the schedule.",
    pros: [
      "Recurring demand — clients return every 3–4 weeks",
      "Commission-based pay scales labor costs with revenue",
      "Low entry barrier: no licenses, simplified sole-proprietor taxation",
      "Breaks even quickly even at half capacity",
    ],
    cons: [
      "Clients follow their technician — a departing tech can take the base",
      "Competition from home-based techs charging 20–30% less",
      "Income depends on utilization — near zero in the first 2–3 months",
      "Rising cost of imported supplies squeezes margins",
    ],
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "Administrator only (fixed). Technicians earn 40% of each ticket — their pay is already baked into the 48% margin.",
        },
      },
    },
  },
  "photo-studio": {
    name: "Hourly rental photo studio",
    shortDescription:
      "1–2 halls with lighting and backdrops that photographers book by the hour.",
    description:
      "A ~100 m² studio with one or two halls (cyclorama, paper backdrops, lighting kit, makeup area) rented by photographers and bloggers by the hour via online booking. Near-zero cost per hour (electricity and backdrop wear) gives ~90% margins. The main risk is occupancy: break-even from ~4 booked hours a day.",
    pros: [
      "~90% margin — near-zero cost per booked hour",
      "No full-time staff needed — online booking and self-service",
      "No expensive cameras required — clients bring their own",
      "Prepaid bookings — zero receivables and predictable cash",
    ],
    cons: [
      "Unpredictable occupancy — first months may see 2–3 h/day at a loss",
      "Strong seasonality: autumn peak, January–February slump",
      "Interiors get stale on Instagram — halls need refreshing every 6 months",
      "Dependence on one premises: a rent hike kills the business",
    ],
    revenueLabels: {
      clientsPerDay: "Booked hours per day",
      averageCheck: "Price per hour (₴)",
    },
  },
  "home-bakery": {
    name: "Home bakery",
    shortDescription: "Custom cakes and desserts made from a home kitchen.",
    description:
      "Made-to-order cakes, bento cakes and desserts produced at home or in a mini-workshop. Start in your own kitchen with semi-pro equipment (convection oven, planetary mixer, dedicated fridge), selling via Instagram and word of mouth. Requires sole-proprietor registration and free food-facility registration with the state food safety service.",
    pros: [
      "Low entry cost with no premises rent",
      "Fast payback of 8–10 months",
      "High ~60% margin after ingredient costs",
      "Flexible schedule with room to scale into a workshop",
    ],
    cons: [
      "Building an Instagram client base takes 3–6 months",
      "Strong seasonality (fasting periods, January are slow)",
      "Owner does everything: baking, decorating, delivery, content",
      "Power outages are critical for the oven and fridge",
    ],
    revenueLabels: {
      clientsPerDay: "Orders per day",
      averageCheck: "Average order value (₴)",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "Solo format: the owner does the work, their income is the model's net profit.",
        },
      },
    },
  },
  "street-food": {
    name: "Street food stand (shawarma)",
    shortDescription:
      "A shawarma stand in a rented kiosk or serving window in a high-traffic spot.",
    description:
      "Classic street food: a rented kiosk or serving window in a high-traffic spot, a shawarma grill, and 2 cooks in shifts. Low entry cost, break-even from ~35 portions a day. Success hinges on a location near offices, transit hubs or campuses, and consistent quality.",
    pros: [
      "Low entry cost and fast payback (6–9 months)",
      "Steady year-round demand for fast food",
      "Simple operations — minimal staff and menu",
      "Break-even from just ~35 portions a day",
    ],
    cons: [
      "Location is everything — weak traffic kills the stand",
      "High competition and kiosk demolition risk",
      "28–38% food cost, sensitive to meat prices",
      "Sanitary inspections and reputation risk from quality issues",
    ],
    revenueLabels: {
      clientsPerDay: "Portions per day",
    },
    fieldOverrides: {
      startup: {
        other: {
          hint: "A generator (a must-have given power outages), rent deposit, reserve.",
        },
      },
    },
  },
  "phone-repair": {
    name: "Smartphone repair service",
    shortDescription:
      "A phone repair spot in a mall: screens, batteries, minor repairs and accessories.",
    description:
      "A small spot (mall kiosk or a 10–15 m² room) repairing smartphones: display, battery, glass and connector replacement, cleaning and reflashing, plus accessory sales. Profit comes from a 100%+ markup on parts and high-margin labour. Success hinges on a high-traffic location, a reliable parts supplier and fast while-you-wait repairs.",
    pros: [
      "Stable demand — repair beats buying a new phone",
      "Low entry barrier: UAH 150–250K and no licenses needed",
      "High margin: 100%+ markup on parts, labour has almost no cost",
      "Fast payback — 6–10 months at average workload",
    ],
    cons: [
      "The business depends on the technician — losing them halts the shop",
      "High competition in cities and price pressure",
      "Dependence on imported parts and exchange rates",
      "First months bring only 2–4 repairs a day — a cash cushion is needed",
    ],
    revenueLabels: {
      clientsPerDay: "Repairs per day",
    },
    fieldOverrides: {
      startup: {
        initialStock: {
          hint: "Initial stock of common spare parts (displays, batteries, glass, cables) for 20–30 popular models plus display-case accessories.",
        },
      },
    },
  },
  "pet-grooming": {
    name: "Pet grooming salon",
    shortDescription: "A 1–2 station grooming salon for dogs and cats.",
    description:
      "A ~50 m² salon with two grooming stations offering full-service grooming (bath, haircut, brushing, nails) for dogs and cats. Groomers earn 40–50% of each ticket, keeping fixed costs low. Ukraine's pet-care market grows ~20% a year, and grooming is a recurring service.",
    pros: [
      "Recurring demand (grooming every 1–2 months)",
      "Pet-care market growing ~20% per year",
      "Groomers paid % of ticket — low fixed costs",
      "Moderate startup and roughly a one-year payback",
    ],
    cons: [
      "Business depends on groomers — they may leave with the client base",
      "First 3–6 months bring 3–5 clients/day instead of 8",
      "High competition in large cities",
      "Seasonality: winter slump, spring–summer peak",
    ],
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "A part-time administrator only. Groomers earn 40–50% of each ticket — their pay is baked into the 47% margin.",
        },
      },
    },
  },
  "sewing-atelier": {
    name: "Sewing atelier",
    shortDescription: "Clothing repair and tailoring with 1–2 seamstresses.",
    description:
      "A small clothing repair and tailoring atelier in a residential area: hemming, zipper replacement, alterations and custom sewing. Low equipment investment (lockstitch, overlock, coverstitch machines), a steady flow of small orders and high margins since costs are just threads and accessories.",
    pros: [
      "Low entry barrier — from UAH 100–175K",
      "High 80–90% margin on repair services",
      "Stable demand: clothes get repaired even in a crisis",
      "Fast payback — 6–8 months per market data",
    ],
    cons: [
      "Revenue is capped by the seamstresses' hands",
      "Shortage of skilled seamstresses, wages rising",
      "Strong dependence on location and foot traffic",
      "First months bring 5–8 orders/day until a client base builds",
    ],
    revenueLabels: {
      clientsPerDay: "Orders per day",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "One hired seamstress; the second is the owner, whose income is the model's net profit.",
        },
      },
    },
  },
  "parcel-pickup": {
    name: "Parcel pickup point",
    shortDescription:
      "A partner pickup point for Nova Poshta / Rozetka / Meest.",
    description:
      "A small parcel pickup and drop-off point (15–25 m²) in a residential area, operating under postal operators' partner programs. Revenue is a fixed commission per handled parcel (UAH 6–20 depending on the operator) plus packaging sales. Minimal staff, no inventory purchasing, processes and software provided by the operator.",
    pros: [
      "No inventory purchasing — margin above 90%",
      "Steady flow: e-commerce is growing, Nova Poshta plans +11,000 points",
      "Simple operations, processes and software provided by the operator",
      "Low entry barrier — from UAH 150K vs 650K+ for a full franchise",
    ],
    cons: [
      "Full dependence on the partner operator's rates and decisions",
      "Economics critically depend on location and parcel flow",
      "Competition from parcel lockers and nearby branches",
      "Low per-parcel commission — profit is sensitive to every expense",
    ],
    revenueLabels: {
      clientsPerDay: "Parcels per day",
      averageCheck: "Income per parcel (₴)",
    },
  },
  "second-hand": {
    name: "Second-hand clothing store",
    shortDescription:
      "A 30–60 m² European second-hand store buying stock by the kilogram with a 3–4x markup.",
    description:
      'A 30–60 m² store selling used clothing from Europe. Stock is bought wholesale by weight (grade 1 at UAH 150–230/kg, cream at 250–500/kg) and sold per item at a 3–4x markup. Second-hand holds ~11% of Ukraine\'s clothing market and keeps growing: demand is crisis-resistant. Success hinges on a high-traffic location, a reliable bale supplier and a weekly "new arrival" discount schedule.',
    pros: [
      "Low entry barrier and fast payback of 4–12 months",
      "Crisis-resistant demand — the segment holds ~11% of the clothing market",
      "High 50–70% margin from buying by weight",
      "No licenses needed — a sole proprietorship and fiscal register suffice",
    ],
    cons: [
      "Bale quality is a lottery — a weak lot can turn kilograms unprofitable",
      "Strong seasonality — summer dips noticeably versus autumn and winter",
      "Growing competition from chains and online resale platforms",
      "Revenue depends critically on location — up to a 3x spread",
    ],
    fieldOverrides: {
      startup: {
        initialStock: {
          hint: "The opening batch is ~400 kg (the ~10 kg/m² norm for 40 m²) of mixed grade-1 and cream stock at ~UAH 180/kg.",
        },
      },
    },
  },
};

export const businessesEn: Business[] = businesses.map((business) => ({
  ...business,
  ...EN_TEXT[business.slug],
}));
