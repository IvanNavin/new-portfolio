# 📋 Im Bruhl - Task Management Application

A modern task management application built with Next.js 14 and Mantine UI, featuring database persistence and a clean, intuitive interface.

## ✨ Features

- ✅ **Task Management** - Create, update, and delete tasks
- 🗃️ **Database Persistence** - PostgreSQL with Prisma ORM
- 🎨 **Modern UI** - Beautiful interface with Mantine components
- 📱 **Responsive Design** - Works on all devices
- 🔄 **Real-time Updates** - Instant feedback on actions
- 🎯 **TypeScript** - Full type safety

## 🛠️ Tech Stack

### Core
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database

### UI
- **Mantine UI 7** - React components library
  - `@mantine/core` - Core components
  - `@mantine/hooks` - Useful React hooks
  - `@mantine/modals` - Modal system
  - `@mantine/dates` - Date picker components
- **Tailwind CSS** - Utility-first CSS
- **PostCSS** - CSS processing

### Utilities
- **@phosphor-icons/react** - Icon library
- **dayjs** - Date manipulation
- **@repo/utils** - Shared utilities
- **@repo/prisma** - Shared Prisma schema

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.0
- Yarn or npm
- PostgreSQL database

### Installation

1. **Navigate to the im-bruhl directory:**
   ```bash
   cd apps/im-bruhl
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Setup environment variables:**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Add your database URL
   DATABASE_URL="postgresql://user:password@localhost:5432/imbruhl"
   POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/imbruhl"
   ```

4. **Generate Prisma client and run migrations:**
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
| `yarn build` | Build for production (includes Prisma generation) |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Fix ESLint errors and format code |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn format` | Format code with Prettier |

## 📁 Project Structure

```
im-bruhl/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── utils/             # Utility functions
│   ├── constants.ts       # Constants
│   ├── context.ts         # React contexts
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── types.ts           # TypeScript types
├── public/                # Static files
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
├── postcss.config.mjs     # PostCSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## 🎨 UI Components

This app uses **Mantine UI v7** for building the interface:

### Core Components
```tsx
import { Button, TextInput, Modal } from '@mantine/core';

<Button variant="filled" color="blue">
  Create Task
</Button>
```

### Modals
```tsx
import { modals } from '@mantine/modals';

modals.open({
  title: 'Create Task',
  children: <TaskForm />
});
```

### Date Pickers
```tsx
import { DatePicker } from '@mantine/dates';

<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Pick date"
/>
```

### Hooks
```tsx
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

const [opened, { open, close }] = useDisclosure(false);
const isMobile = useMediaQuery('(max-width: 768px)');
```

## 🗃️ Database

### Prisma Schema

The database schema is shared via `@repo/prisma`. Common models might include:

```prisma
model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (caution!)
npx prisma migrate reset
```

## 🎯 Icons

Uses **Phosphor Icons** for consistent iconography:

```tsx
import { Check, X, Plus } from '@phosphor-icons/react';

<Button leftSection={<Plus size={20} />}>
  Add Task
</Button>
```

## 📦 Shared Packages

This app uses shared packages from the monorepo:

- **@repo/prisma** - Shared database schema and Prisma client
- **@repo/utils** - Shared utility functions
- **@vercel/postgres** - Vercel Postgres integration

## 🌐 API Routes

Example API route structure:

```typescript
// app/api/tasks/route.ts
export async function GET() {
  const tasks = await prisma.task.findMany();
  return Response.json(tasks);
}

export async function POST(request: Request) {
  const data = await request.json();
  const task = await prisma.task.create({ data });
  return Response.json(task);
}
```

## 🎨 Styling

### Mantine Theme

Configure Mantine theme in your layout:

```tsx
import { MantineProvider } from '@mantine/core';

<MantineProvider theme={{ colorScheme: 'light' }}>
  {children}
</MantineProvider>
```

### PostCSS Configuration

The app uses PostCSS with Mantine preset:

```javascript
// postcss.config.mjs
export default {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {}
  }
};
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   ```
   DATABASE_URL
   POSTGRES_PRISMA_URL
   ```
4. Deploy

The build command automatically runs `prisma generate`:
```bash
echo $POSTGRES_PRISMA_URL && prisma generate && next build
```

## 🐛 Troubleshooting

### Prisma Client Not Found

```bash
yarn generate:prisma
# or
npx prisma generate
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules .next
yarn install
```

### TypeScript Errors

```bash
yarn typecheck
```

## 📝 License

Part of the Portfolio Monorepo - MIT License

## 🤝 Contributing

See the [main repository README](../../README.md) for contribution guidelines.

---

Built with ❤️ using Next.js and Mantine UI
