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
      "The start is a phone in your hand and free editing tools: the cash investment is near zero — a microphone and a light are the only worthwhile purchases. The real investment is time: on average ~100 videos and 12–18 months to steady monetization (YouTube threshold: 1,000 subscribers + 4,000 watch hours). The model's figures show an established channel; sponsorships, not YouTube payouts, drive most of the income.",
    pros: [
      "Starts with a phone — near-zero cash investment",
      "The channel is an asset that accumulates an audience",
      "Several income streams: ads, integrations, products",
      "Not tied to a location",
    ],
    cons: [
      "No income for the first 12–18 months (≈100 videos) — you pay with time",
      "Full dependence on platform algorithms",
      "Fierce competition for attention",
      "Burnout: content is needed constantly",
    ],
    revenueLabels: {
      clientsPerDay: "Thousands of views per day",
      averageCheck: "Revenue per 1000 views: ads + sponsorships (₴)",
    },
    fieldOverrides: {
      startup: {
        equipment: {
          hint: "You can start with just a phone (₴0). The 15k covers a lav mic, a light and a tripod; a camera comes later out of revenue.",
        },
      },
      monthly: {
        salaries: {
          hint: "Shooting and editing yourself = 0. A freelance editor runs ~UAH 500–1,500 per video — add it here if you delegate.",
        },
      },
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
      startup: {
        renovation: {
          hint: "Adapting the home kitchen for food-facility registration: sink, work surfaces, zoning.",
        },
      },
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
  "sushi-delivery": {
    name: "Dark kitchen: sushi delivery",
    shortDescription:
      "A delivery-only kitchen making sushi for aggregators and direct orders, with no dining room.",
    description:
      "A compact 40–50 m² kitchen with no dining room, selling sushi sets via Glovo/Bolt Food, Instagram and its own site. Sushi is one of Ukraine's top delivery categories, and the dark kitchen format cuts rent, fit-out and front-of-house staff costs. Break-even sits near 20 orders a day.",
    pros: [
      "Sushi is a top delivery category with steady demand",
      "No dining room, waitstaff, or high-traffic location costs",
      "Fast launch: 1–2 months from lease to first sales",
      "Easy to scale via a second kitchen or a multi-brand menu",
    ],
    cons: [
      "Sushi food cost of 40–52% is the highest in delivery",
      "Glovo/Bolt Food commissions of 20–35% eat aggregator-order margins",
      "Intense competition and price wars in every city",
      "Perishable fish means strict HACCP compliance and spoilage risk",
    ],
    revenueLabels: {
      clientsPerDay: "Orders per day",
    },
    fieldOverrides: {
      startup: {
        initialStock: {
          hint: "Fish (salmon, eel), rice, nori, sauces plus an initial batch of packaging. Most ingredients are imported and FX-sensitive.",
        },
      },
      monthly: {
        salaries: {
          hint: "Two sushi chefs on rotating shifts plus a packer-helper. Couriers belong to the aggregators; the owner handles orders and purchasing.",
        },
      },
    },
  },
  "mini-bakery": {
    name: "Mini bakery",
    shortDescription:
      "A fresh-baked goods spot with its own oven: croissants, buns, bread.",
    description:
      "A 35–45 m² full-cycle mini bakery: convection oven, proofer, dough mixer. The range covers croissants, sweet buns, bread and takeaway coffee. Key requirements are a high-traffic location, 380V power with backup for outages, and disciplined early-morning shifts.",
    pros: [
      "Daily demand for fresh pastry regardless of season",
      "High margin on baked goods and coffee (28–40% food cost)",
      "12–18 month payback per market data",
      "Fresh bread smell is free marketing for the location",
    ],
    cons: [
      "Expensive equipment — new gear pushes the budget past UAH 1M",
      "Critical dependence on electricity: a blackout stops the oven",
      "Night/early shifts and a shortage of experienced bakers",
      "Success depends almost entirely on the location's foot traffic",
    ],
  },
  "food-truck": {
    name: "Food truck (burgers)",
    shortDescription:
      "A mobile burger kitchen: a city spot on weekdays plus festivals and events on weekends.",
    description:
      "A used food truck or trailer with kitchen equipment (grill, fryer, fridge) sells craft burgers. The base is a high-traffic city spot licensed by the local council, boosted by food festivals and events. Location and season are the key variables: April–October generates most of the annual revenue.",
    pros: [
      "Mobility — you can chase foot traffic by relocating",
      "Startup is 2–3x cheaper than a stationary cafe",
      "Fast payback in a good season (6–9 months per sources)",
      "Festivals and events deliver peak revenue without permanent rent",
    ],
    cons: [
      "Strong seasonality — winter traffic drops 40–60%",
      "Dependence on municipal permits and competition for prime spots",
      "Weather, air-raid alerts and event cancellations hit revenue directly",
      "Used equipment carries hidden breakdown and downtime risk",
    ],
    revenueLabels: {
      clientsPerDay: "Orders per day",
    },
    fieldOverrides: {
      startup: {
        equipment: {
          hint: "The bulk is the used food truck or trailer itself (~UAH 390k) plus fitting it out with a grill, fryer and refrigeration.",
        },
      },
      monthly: {
        rent: {
          hint: "City spot fees and festival entry fees — not premises rent.",
        },
      },
    },
  },
  "frozen-food": {
    name: "Frozen semi-finished foods production",
    shortDescription:
      "A mini-workshop making varenyky, dumplings and cutlets sold to shops, markets and online.",
    description:
      'A mini-workshop producing craft "hand-made style" frozen foods: varenyky, pelmeni and cutlets. Sales go to small grocery stores and butcher shops (wholesale UAH 75–110/kg), markets and online orders (UAH 130–180/kg). Requires an operational permit from the State Food Safety Service and a HACCP system; the craft segment keeps growing as consumers move away from mass-market products.',
    pros: [
      "Stable year-round demand for frozen convenience food",
      "~50% margin after ingredients in the craft segment",
      "Compact start: a UAH 51k machine instead of multi-million lines",
      "Diversified sales: shops, markets, online, HoReCa",
    ],
    cons: [
      "Requires a state food-safety operational permit and HACCP",
      "Distribution is built door-to-door across shops and markets",
      "Exposed to meat and flour price swings",
      "Cold chain risk: power outages can spoil whole batches",
    ],
    revenueLabels: {
      clientsPerDay: "Kilograms sold per day",
      averageCheck: "Price per kg (₴)",
    },
  },
  microgreens: {
    name: "Microgreens farm",
    shortDescription:
      "Rack-based microgreens growing for restaurants and shops.",
    description:
      "A mini-farm with 5 racks (~120 trays at once) in a 15–20 m² room. 7–14 day cycle, ~3 turns per month. Sales: restaurants and cafes (wholesale UAH 80–110/tray), eco-shops and the market. The key to profit is 10–15 regular HoReCa clients.",
    pros: [
      "Low entry barrier and fast 7–14 day production cycle",
      "60–70% margin — a tray costs UAH 30–40 vs a 120 price",
      "Can start at home/garage with no hired staff",
      "Healthy eating trend — HoReCa demand is growing",
    ],
    cons: [
      "Sales are the main risk: without regular clients produce spoils in 2–3 days",
      "Niche demand in Ukraine, restaurant orders dip in summer",
      "Electricity-dependent (grow lights) — outages are critical",
      "Daily manual work with no days off: sowing, watering, delivery",
    ],
    revenueLabels: {
      clientsPerDay: "Trays per day",
      averageCheck: "Price per tray (₴)",
    },
    fieldOverrides: {
      startup: {
        renovation: {
          hint: "Wiring for grow lights, a sink and moisture-proof finishing of the growing room.",
        },
      },
      monthly: {
        salaries: {
          hint: "Owner-operated: sowing, care, packing and delivery — their income is the model's net profit.",
        },
      },
    },
  },
  "candle-workshop": {
    name: "Scented candle making",
    shortDescription:
      "A home studio making soy scented candles sold via Instagram, craft markets and shops.",
    description:
      "Making soy wax scented candles in a home studio. Material cost per 250 ml candle is about UAH 165, retail price UAH 400–550. Sales via Instagram/TikTok, craft markets and gift shops on consignment; demand peaks September through December.",
    pros: [
      "Low entry barrier and home-based work with no rent",
      "55–65% margin after material costs",
      "Fast payback — 3–4 months with steady sales",
      "Easy to scale via wholesale, corporate gifts and B2B",
    ],
    cons: [
      "High competition among handmade brands",
      "Strong seasonality — summer sales drop by half",
      "Sales fully depend on social media content and activity",
      "Manual work caps volume without hiring helpers",
    ],
    revenueLabels: {
      clientsPerDay: "Sales per day",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "Solo format: the owner makes, packs and runs social media. Above ~300 candles/month budget a part-time packing assistant.",
        },
      },
    },
  },
  "carpentry-workshop": {
    name: "Carpentry workshop",
    shortDescription:
      "Custom wood and chipboard furniture made by 1–2 craftsmen.",
    description:
      "A ~100 m² workshop with a panel saw, edge-banding equipment and routing tools. Produces custom kitchens, sliding-door wardrobes and cabinet furniture: 6–7 projects per month with an average order of ~UAH 35,000. The owner works as a craftsman alongside one hired carpenter; materials take up about half of the product price.",
    pros: [
      "Steady demand for furniture fitting non-standard layouts",
      "High margin (~45%) after material costs",
      "Small team makes quality easy to control",
      "Portfolio and word of mouth cut ad spend over time",
    ],
    cons: [
      "Requires real carpentry skills and experience",
      "Long production cycle — a kitchen takes 1–2 weeks",
      "Chipboard and hardware prices depend on exchange rates",
      "Few orders in the first months until reputation builds",
    ],
    revenueLabels: {
      clientsPerDay: "Orders per day",
      averageCheck: "Average order value (₴)",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "One hired carpenter; the second craftsman is the owner, who lives off the profit.",
        },
      },
    },
  },
  "print-merch": {
    name: "Merch printing & small print shop",
    shortDescription:
      "DTF and sublimation printing on t-shirts, mugs, bags plus small-format printing.",
    description:
      "A merch printing workshop: a compact DTF printer for t-shirts and textiles, sublimation for mugs, heat presses and a colour laser printer for business cards and flyers. Revenue mixes retail orders via Instagram and the website with B2B corporate merch orders. Equipment starts underutilized, so the business can triple output without new capital investment.",
    pros: [
      "High 55–60% gross margin on textiles and mugs",
      "Repeat B2B corporate merch orders",
      "Equipment scales 3x output with no extra capex",
      "Multiple technologies mean multiple revenue streams",
    ],
    cons: [
      "Imported equipment and consumables depend on exchange rates",
      "DTF print heads need daily maintenance and are costly to repair",
      "Strong competition from large print shops on tenders",
      "Order flow is unstable in the first 3–6 months",
    ],
    revenueLabels: {
      clientsPerDay: "Orders per day",
    },
  },
  "fitness-studio": {
    name: "Group fitness studio",
    shortDescription:
      "A 100–150 m² studio for functional training, yoga and stretching without gym machines.",
    description:
      "A 100–150 m² group class studio: functional training, yoga and stretching in groups of 7–12. No expensive gym machines — only light equipment (TRX, kettlebells, mats), so the launch costs 3–5x less than a classic fitness club. The key to success is class occupancy: reach 5–6 classes/day with 7–8 participants each.",
    pros: [
      "Launch is several times cheaper than a machine-based gym",
      "Per-class trainer pay means costs scale with revenue",
      "Recurring income from memberships and prepayments",
      "Demand for group formats is growing and equipment barely wears out",
    ],
    cons: [
      "Profit depends critically on class occupancy",
      "Strong competition from studios and big chains",
      "Summer seasonal dips and client churn if a star trainer leaves",
      "Blackouts and war-related risks require a generator and cash reserve",
    ],
    revenueLabels: {
      clientsPerDay: "Visits per day",
      averageCheck: "Income per visit (₴)",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "Only the admin and cleaning; trainers are paid per class (UAH 250–400), which is accounted for in the margin.",
        },
      },
    },
  },
  "quest-room": {
    name: "Escape room",
    shortDescription:
      "Two story-driven escape rooms with props and electronics for teams of 2–6 players.",
    description:
      'A 100–110 m² venue with two escape rooms of different genres, a reception and waiting area in a 300k+ city. Revenue comes from hourly team games (birthdays, corporate events, dates). The cost per game is tiny, so margins are high, but rooms need a refresh every 1.5–2 years as the audience "completes" the plot.',
    pros: [
      "High gross margin — cost per game is tiny",
      "No licence needed, simple sole-trader setup",
      "Steady event demand: birthdays and corporate bookings",
      "Prepaid bookings — zero receivables",
    ],
    cons: [
      'Rooms "burn out" — the plot needs rebuilding every 1.5–2 years',
      "Weak weekday load, peaks only on weekends and holidays",
      "Air-raid alerts and seasonality cancel sessions",
      "Success hinges on puzzle quality — ads won't save a weak plot",
    ],
    revenueLabels: {
      clientsPerDay: "Games per day",
      averageCheck: "Price per game (₴)",
    },
  },
  "massage-studio": {
    name: "Massage studio",
    shortDescription:
      "A 1–2 table studio offering classic, wellness and sports massage.",
    description:
      "A compact 10–30 m² massage studio with one or two tables offering classic, wellness and sports massage. Therapists work on a revenue-share basis, keeping fixed costs minimal. Medical massage requires a Ministry of Health licence, so the start is wellness-only without one.",
    pros: [
      "Low entry cost — from UAH 120k",
      "Revenue-share pay means costs fall with revenue",
      "Steady demand for wellness services and repeat courses",
      "An owner-therapist keeps an extra 35–40% of their own sessions",
    ],
    cons: [
      "Revenue depends directly on therapists' skill and reputation",
      "Medical massage requires a MoH licence or a licensed medic",
      "Low occupancy in the first 3–6 months may mean losses",
      "Strong competition from home-based private therapists",
    ],
    revenueLabels: {
      clientsPerDay: "Sessions per day",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "Therapists earn 35–40% of each check — already deducted in the 55% margin. This line covers only a guaranteed minimum / admin work.",
        },
      },
    },
  },
  "tire-service": {
    name: "Tire service",
    shortDescription:
      "Two bays: seasonal tire changes, balancing, puncture repair and tire storage.",
    description:
      "A two-bay tire shop: seasonal tire changeovers, wheel balancing, puncture repair and seasonal tire storage. The business is sharply seasonal — the October–November and March–April peaks bring 60–70% of annual revenue, so the model uses year-averaged figures, while tire storage and repairs smooth out the off-season.",
    pros: [
      "Guaranteed twice-a-year demand for tire changes",
      "Simple service with no licences or complex staffing",
      "Tire storage creates repeat clients and passive income",
      "Revenue-share pay for mechanics lowers off-season risk",
    ],
    cons: [
      "Sharp seasonality with 4–6 slow months a year",
      "High competition and price-sensitive customers",
      "Revenue depends heavily on location and traffic",
      "Needs a cash reserve for the off-season and rising utility costs",
    ],
    revenueLabels: {
      clientsPerDay: "Cars per day",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "Mechanics' fixed base pay; their revenue share (~25%) is already reflected in the 65% margin.",
        },
      },
    },
  },
  "english-school": {
    name: "English language school",
    shortDescription:
      "A small English school: 2 classrooms, group and 1-on-1 lessons, offline+online.",
    description:
      "A language school with ~100–120 active students in a ~75 m² space with two classrooms. Note: a solo tutor starts with almost no capital — this model is about a full school with rent, fit-out and a teaching team. Core revenue comes from group lessons (6–8 students, UAH 250–350 per student), supplemented by 1-on-1 lessons and online groups. No licence required (non-formal education); reaching the target 30 visits/day takes 4–6 months of enrollment.",
    pros: [
      "Consistently high demand for English, boosted by EU integration",
      "Teacher pay as % of revenue keeps costs scaling with income",
      "Online groups add revenue without extra rent",
      "Monthly/semester prepayment creates a positive cash cycle",
    ],
    cons: [
      "Heavy competition from chains and online platforms",
      "Strong seasonality: summer enrollment drops 30–40%",
      "Business depends on star teachers who may leave with students",
      "Slow ramp-up: 4–6 months to reach target occupancy",
    ],
    revenueLabels: {
      clientsPerDay: "Student visits per day",
      averageCheck: "Price per lesson per student (₴)",
    },
    fieldOverrides: {
      startup: {
        initialStock: {
          label: "Textbooks & materials",
          hint: "Course books, handouts and tests for the first groups.",
        },
        other: {
          hint: "Rent deposit + a cash cushion for the 4–6 months of enrollment.",
        },
      },
      monthly: {
        salaries: {
          hint: "Only the administrator is here. Teachers earn ~45% of student fees per lesson taught — already reflected in the 55% margin.",
        },
      },
    },
  },
  "carpet-cleaning": {
    name: "Mobile upholstery cleaning",
    shortDescription:
      "On-site sofa, mattress and carpet cleaning with an extractor.",
    description:
      "Mobile deep-cleaning service for upholstery, mattresses and carpets: the operator drives to the client with a professional extractor and chemicals. No premises needed — equipment is stored at home and all work happens on-site. Chemical cost per job is UAH 50–150 against a ~1,500 ticket, so post-consumables margin is ~90%.",
    pros: [
      "No premises rent — near-zero fixed costs at start",
      "Very high margin: chemicals cost UAH 50–150 per UAH 1,500 job",
      "Fast payback — 4–6 months per real Ukrainian cases",
      "Low entry barrier: one ~UAH 33k extractor is enough to start",
    ],
    cons: [
      "Strong seasonality — summer demand for upholstery cleaning drops",
      "High competition in big cities with dozens of providers on marketplaces",
      "Physically demanding: 2–3 daily jobs hauling equipment",
      "Income depends directly on ads and reputation — no leads means idle gear",
    ],
    revenueLabels: {
      clientsPerDay: "Jobs per day",
    },
    fieldOverrides: {
      monthly: {
        other: {
          hint: "Fuel, own-car maintenance and depreciation, parking — the logistics of client visits.",
        },
      },
    },
  },
  "kids-playroom": {
    name: "Kids' play room",
    shortDescription:
      "An 80–120 m² play zone in a mall: hourly kids' stays plus birthday parties.",
    description:
      "A kids' play room in a shopping mall featuring a play maze, trampoline, ball pit and toddler zone. Core revenue comes from hourly stays (UAH 100–150/hour), supplemented by birthday party packages from UAH 3,000–5,000. Service cost is minimal so margins are high; success hinges on picking a mall with steady family footfall.",
    pros: [
      "High margin — the cost per visit is minimal",
      "Steady demand: mall parents need supervised childcare",
      "Birthday parties bring prepaid high-ticket orders",
      "Simple operations — two rotating staff are enough",
    ],
    cons: [
      "Fully dependent on the specific mall's foot traffic",
      "Strong seasonality: summer attendance drops 30–40%",
      "Heightened safety requirements and liability for children",
      "Equipment wears out and needs regular renewal",
    ],
    revenueLabels: {
      clientsPerDay: "Visits per day",
    },
  },
  "detailing-studio": {
    name: "Auto detailing studio",
    shortDescription:
      "Interior detailing, polishing and ceramic coating, 1–2 bays.",
    description:
      "A deep-care auto studio in a rented ~100 m² bay: interior detailing (UAH 5–6k), corrective polishing (8–11k) and ceramic coatings (9–16k). Masters work on commission, keeping fixed costs low. Long jobs cap throughput at ~2 cars/day, but the high ticket yields roughly a one-year payback.",
    pros: [
      "High average ticket of UAH 5–16k per job",
      "45–70% margin after chemicals and masters' commission",
      "Launch within UAH 630k in a rented bay",
      "Steady demand: Ukraine's aging car fleet needs care",
    ],
    cons: [
      "Quality depends on scarce and expensive masters",
      "Ramp-up to 2 cars/day takes 3–6 months",
      "Seasonality: ceramic and polishing dip in winter",
      "Long jobs physically cap daily throughput",
    ],
    revenueLabels: {
      clientsPerDay: "Cars per day",
    },
    fieldOverrides: {
      monthly: {
        salaries: {
          hint: "Admin/booking only. Masters earn ~40% of their output — already reflected in the 45% margin.",
        },
      },
    },
  },
  "tool-rental": {
    name: "Construction tool rental",
    shortDescription:
      "A rental point for rotary hammers, generators, concrete mixers and scaffolding.",
    description:
      "A tool rental point with a fleet of 35–40 units in a residential district: rotary hammers and breakers (UAH 150–300/day), concrete mixers, generators (UAH 600) and scaffolding. The daily rate equals 5–10% of the tool's retail price; a deposit of ~30% of value covers non-returns. Each unit pays for itself in ~6 months, while ~30% of turnover goes to repairs and scheduled replacement.",
    pros: [
      "No licences required, easy start as a sole proprietor",
      "Each tool unit pays for itself in about 6 months",
      "A deposit of ~30% of tool value covers theft and damage",
      "Generators provide steady demand even off-season",
    ],
    cons: [
      "Strong seasonality: peak May–October, demand drops in winter",
      "Rented tools wear out fast — up to 30% of turnover goes to repairs",
      "Risk of non-returns and damage exceeding the deposit",
      "Profit depends heavily on location and fleet utilization",
    ],
    revenueLabels: {
      clientsPerDay: "Active rentals per day",
      averageCheck: "Rental price per day (₴)",
    },
    fieldOverrides: {
      startup: {
        equipment: {
          hint: "A fleet of 35–40 units: rotary hammers/breakers, concrete mixers, generators, scaffolding, angle grinders, tile cutters.",
        },
      },
    },
  },
  "pet-shop": {
    name: "Pet supplies store",
    shortDescription:
      "A pet food and accessories store in a residential neighbourhood.",
    description:
      "A 30–50 m² shop selling pet food, treats and accessories for cats and dogs, no live animals. Ukraine's pet market grows 15–20% yearly, with food driving ~65% of revenue and steady repeat purchases. Neighbourhood-store format with the owner behind the counter; the main investment is inventory (~UAH 300k).",
    pros: [
      "Market grows 15–20% yearly even in crisis",
      "Pet food means repeat purchases and loyal regulars",
      "No live animals — minimal permits and vet requirements",
      "Long shelf life, low write-offs",
    ],
    cons: [
      "Thin food margins (20–30%) — profit depends on volume",
      "Chain and e-commerce pressure: 6 closures per 10 openings",
      "Location is everything — 15 customers/day instead of 27 kills profit",
      "Large capital frozen in inventory",
    ],
    fieldOverrides: {
      startup: {
        initialStock: {
          hint: "First inventory: pet food (~65% of range), treats, litter and accessories — with a reserve for a second order in 2–3 weeks.",
        },
      },
    },
  },
  "flower-shop": {
    name: "Flower shop",
    shortDescription:
      "Bouquets, arrangements and flower delivery from a 15–30 m² shop.",
    description:
      "A 15–30 m² retail spot with a floral cooler: bouquets, custom arrangements, delivery. Markups run 100–300%, but flowers are perishable: 10–20% of stock is written off, and over a third of annual revenue comes from a few peak dates (Feb 14, Mar 8, Sep 1). Profit hinges on a high-traffic location, Instagram sales and purchasing discipline.",
    pros: [
      "High markup on flowers (100–300%)",
      "Growing market (+23% in 2024, to UAH 9.5B)",
      "Low entry barrier vs other retail",
      "Instagram and delivery drive sales without a prime location",
    ],
    cons: [
      "Perishable stock — 10–20% of purchases written off",
      "Sharp seasonality: a third of revenue from 2–3 dates, summer slump",
      "Heavy competition including supermarkets and kiosks",
      "Needs a skilled florist — purchasing mistakes eat the profit",
    ],
    fieldOverrides: {
      startup: {
        initialStock: {
          hint: "First purchase of flowers, greenery and packaging. 10–20% of the batch will wilt before it sells — keep the initial assortment narrow.",
        },
      },
    },
  },
  "web-studio": {
    name: "Web studio",
    shortDescription:
      "Website and landing page development for small businesses by a 2–3 person team.",
    description:
      "A small web studio: two founders (developer and PM/sales) plus a hired junior developer, with design outsourced per project. Order mix: landing pages (UAH 15–45k), corporate websites, online stores and international clients via Upwork ($1,500–3,000). The key to profit is a steady pipeline: expect 1–2 projects per month for the first 3–6 months; reaching ~4 takes case studies and active sales.",
    pros: [
      "Minimal startup investment and fast payback",
      "Access to international clients with 2–4x higher project values",
      "No rent, warehouse, or inventory",
      "Scales via subcontractors without growing fixed costs",
    ],
    cons: [
      "Unstable pipeline — only 1–2 projects per month at the start",
      "Heavy competition from freelancers and AI website builders",
      "Founders' early income is below a developer's market salary",
      "Sales and negotiations consume up to a third of the team's time",
    ],
    revenueLabels: {
      clientsPerDay: "Projects per day",
      averageCheck: "Average project value (₴)",
    },
    fieldOverrides: {
      monthly: {
        rent: {
          hint: "Coworking or fully remote (then 0) — an office is optional.",
        },
        salaries: {
          hint: "A hired junior developer; the founders live off the profit. Design is outsourced per project (~25% of budget, reflected in the margin).",
        },
        software: {
          hint: "Work tools: Figma, hosting, repositories, AI assistant subscriptions.",
        },
      },
    },
  },
};

export const businessesEn: Business[] = businesses.map((business) => ({
  ...business,
  ...EN_TEXT[business.slug],
}));
