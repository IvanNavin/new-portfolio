# 📊 Pokedex - Pokémon Encyclopedia

An interactive Pokémon encyclopedia built with Next.js 14 and Mantine UI, featuring a complete database of Pokémon with search, filtering, and detailed information.

## ✨ Features

- 🔍 **Advanced Search** - Search Pokémon by name, type, or ability
- 🎨 **Beautiful UI** - Modern design with Mantine components
- 📊 **Detailed Stats** - Complete Pokémon information and statistics
- 🗃️ **Database** - PostgreSQL with Prisma ORM
- 📱 **Responsive** - Works perfectly on all devices
- 🎯 **TypeScript** - Fully typed for better DX

## 🛠️ Tech Stack

### Core
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database

### UI
- **Mantine UI 7** - Component library
  - `@mantine/core` - Core components
  - `@mantine/hooks` - React hooks
  - `@mantine/modals` - Modal system
- **SASS** - CSS preprocessor
- **classnames** - Conditional class names

### Data & API
- **@repo/prisma** - Shared Prisma schema
- **@repo/utils** - Shared utilities
- **@vercel/postgres** - Vercel Postgres
- **node-fetch** - HTTP client

### Development
- **@repo/eslint-config** - Shared ESLint config
- **Prettier** - Code formatting

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.0
- Yarn or npm
- PostgreSQL database

### Installation

1. **Navigate to the pokedex directory:**
   ```bash
   cd apps/pokedex
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```

   Add your database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/pokedex"
   POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/pokedex"
   ```

4. **Generate Prisma client and seed database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development server:**
   ```bash
   yarn dev
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Generate Prisma client and start dev server |
| `yarn build` | Generate Prisma client and build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Fix ESLint errors and format code |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn format` | Format code with Prettier |

## 📁 Project Structure

```
pokedex/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── pokemon/           # Pokémon pages
│   ├── components/        # React components
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                # Static files
├── next.config.mjs        # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## 🗃️ Database Schema

### Pokémon Model

```prisma
model Pokemon {
  id          Int      @id
  name        String
  types       Type[]
  abilities   Ability[]
  stats       Stat[]
  height      Int
  weight      Int
  sprite      String
  description String?
}

model Type {
  id    Int    @id
  name  String
}

model Ability {
  id    Int    @id
  name  String
}
```

## 🎨 UI Components

### Mantine Components

```tsx
import { Card, Badge, Group, Text } from '@mantine/core';

<Card shadow="sm" padding="lg">
  <Group position="apart">
    <Text weight={500}>Pikachu</Text>
    <Badge color="yellow">Electric</Badge>
  </Group>
</Card>
```

### Modals

```tsx
import { modals } from '@mantine/modals';

const openPokemonDetails = (pokemon) => {
  modals.open({
    title: pokemon.name,
    children: <PokemonDetails data={pokemon} />
  });
};
```

## 🔍 Search & Filter

The Pokedex includes advanced search and filtering:

- **Search by name** - Type to find Pokémon
- **Filter by type** - Electric, Fire, Water, etc.
- **Filter by generation** - Gen 1-9
- **Sort options** - By ID, name, or stats

## 📦 Shared Packages

- **@repo/prisma** - Shared Prisma schema
- **@repo/utils** - Shared utility functions
- **@repo/eslint-config** - ESLint configuration

## 🌐 API Routes

### Get All Pokémon

```typescript
// app/api/pokemon/route.ts
export async function GET() {
  const pokemon = await prisma.pokemon.findMany({
    include: { types: true, abilities: true }
  });
  return Response.json(pokemon);
}
```

### Get Pokémon by ID

```typescript
// app/api/pokemon/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const pokemon = await prisma.pokemon.findUnique({
    where: { id: parseInt(params.id) }
  });
  return Response.json(pokemon);
}
```

## 🎨 Styling

Uses **SASS** for component-specific styles:

```scss
.pokemon-card {
  @apply rounded-lg shadow-md;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  .type-badge {
    &.electric { background: #f7d02c; }
    &.fire { background: #f08030; }
    &.water { background: #6890f0; }
  }
}
```

## 🌐 Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Build Command

```bash
prisma generate && next build
```

## 🐛 Troubleshooting

### Prisma Client Error

```bash
npx prisma generate
```

### Database Connection Error

Check your `DATABASE_URL` in `.env` file.

### Missing Pokémon Data

Run the seed script:
```bash
npx prisma db seed
```

## 📝 License

Part of the Portfolio Monorepo - MIT License

---

Built with ❤️ for Pokémon fans
