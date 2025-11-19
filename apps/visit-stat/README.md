# 📈 Visit Statistics Dashboard

A modern analytics dashboard built with Next.js 15 and Mantine React Table, featuring visitor statistics tracking, data visualization, and real-time updates.

## ✨ Features

- 📊 **Data Visualization** - Interactive tables and charts
- 🔄 **Real-time Updates** - Live data refresh
- 🗃️ **Database** - PostgreSQL with Prisma
- 🎨 **Modern UI** - Mantine UI components
- 📱 **Responsive** - Mobile-first design
- 🎯 **TypeScript** - Full type safety
- 📅 **Date Filtering** - Filter by date ranges

## 🛠️ Tech Stack

### Core
- **Next.js 15** - Latest React framework
- **React 19** - Latest React version
- **TypeScript** - Type safety

### UI & Components
- **Mantine UI 8** - Latest component library
  - `@mantine/core` - Core components
  - `@mantine/hooks` - React hooks
  - `@mantine/dates` - Date picker components
  - `@mantine/notifications` - Toast notifications
- **Mantine React Table** - Advanced data tables
- **@tabler/icons-react** - Icon library
- **Tailwind CSS** - Utility-first CSS
- **clsx** - Conditional classes

### Data & Utilities
- **dayjs** - Date manipulation
- **Prisma** - Database ORM
- **PostgreSQL** - Database

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.0
- Yarn or npm
- PostgreSQL database

### Installation

1. **Navigate to the visit-stat directory:**
   ```bash
   cd apps/visit-stat
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
   DATABASE_URL="postgresql://user:password@localhost:5432/visitstat"
   POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/visitstat"
   ```

4. **Generate Prisma client and migrate:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
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
| `yarn dev` | Start development server |
| `yarn build` | Generate Prisma client and build |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn format` | Format code with Prettier |

## 📁 Project Structure

```
visit-stat/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── components/   # React components
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Dashboard page
│   ├── lib/              # Library code
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── public/               # Static files
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── postcss.config.mjs    # PostCSS configuration
├── eslint.config.mjs     # ESLint configuration (flat config)
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## 📊 Mantine React Table

This app uses **Mantine React Table** for advanced data tables:

### Basic Table Setup

```tsx
import { MantineReactTable } from 'mantine-react-table';

const columns = [
  {
    accessorKey: 'visitor',
    header: 'Visitor',
  },
  {
    accessorKey: 'pageViews',
    header: 'Page Views',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
];

<MantineReactTable
  columns={columns}
  data={data}
  enableSorting
  enableFiltering
  enablePagination
/>
```

### Features

- ✅ Sorting
- ✅ Filtering
- ✅ Pagination
- ✅ Column visibility
- ✅ Row selection
- ✅ Export to CSV
- ✅ Sticky headers
- ✅ Responsive

## 🎨 UI Components

### Mantine UI v8

```tsx
import { Button, Card, Group, Title } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

<Card shadow="sm" padding="lg">
  <Group justify="space-between">
    <Title order={3}>Statistics</Title>
    <Button leftSection={<IconDownload size={20} />}>
      Export
    </Button>
  </Group>
</Card>
```

### Date Pickers

```tsx
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';

<DatePickerInput
  type="range"
  label="Date Range"
  value={dateRange}
  onChange={setDateRange}
/>
```

### Notifications

```tsx
import { notifications } from '@mantine/notifications';

notifications.show({
  title: 'Success',
  message: 'Data exported successfully',
  color: 'green'
});
```

## 🗃️ Database Schema

### Visit Model

```prisma
model Visit {
  id        String   @id @default(cuid())
  visitor   String
  page      String
  pageViews Int
  duration  Int      // in seconds
  date      DateTime
  createdAt DateTime @default(now())
}
```

### Prisma Commands

```bash
# Generate client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 📅 Date Utilities

Uses **dayjs** for date manipulation:

```typescript
import dayjs from 'dayjs';

// Format date
const formatted = dayjs(date).format('MMM DD, YYYY');

// Date ranges
const startOfWeek = dayjs().startOf('week');
const endOfWeek = dayjs().endOf('week');

// Comparison
const isToday = dayjs(date).isSame(dayjs(), 'day');
```

## 🎯 Icons

Uses **Tabler Icons**:

```tsx
import {
  IconCalendar,
  IconChartBar,
  IconDownload,
  IconFilter
} from '@tabler/icons-react';

<IconChartBar size={24} stroke={1.5} />
```

## 🌐 API Routes

### Get Statistics

```typescript
// app/api/stats/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  
  const stats = await prisma.visit.findMany({
    where: {
      date: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      }
    }
  });
  
  return Response.json(stats);
}
```

## 🎨 Styling

### Tailwind CSS v4

This app uses the latest Tailwind CSS with PostCSS:

```tsx
<div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
  <div className="flex-1">
    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
  </div>
</div>
```

### PostCSS Configuration

```javascript
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

## 🌐 Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   ```
   DATABASE_URL
   POSTGRES_PRISMA_URL
   ```
4. Deploy

### Build Command

```bash
echo $POSTGRES_PRISMA_URL && prisma generate && next build
```

## ⚙️ Configuration

### ESLint Flat Config

This app uses the new ESLint flat config format:

```javascript
// eslint.config.mjs
export default [
  {
    ignores: ['.next', 'node_modules']
  },
  // ... other configs
];
```

### Next.js 15 Config

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
```

## 🐛 Troubleshooting

### React 19 Compatibility

Some packages might not be compatible with React 19 yet. Check for updates.

### Prisma Client Error

```bash
npx prisma generate
```

### Tailwind CSS v4 Issues

Make sure you're using `@tailwindcss/postcss` plugin, not the old version.

### Module Resolution Error

Clear cache and reinstall:
```bash
rm -rf .next node_modules
yarn install
```

## 📝 License

Part of the Portfolio Monorepo - MIT License

## 🤝 Contributing

See the [main repository README](../../README.md) for contribution guidelines.

---

Built with ❤️ using Next.js 15 and Mantine UI 8
