# 🌐 Portfolio - Personal Website

A modern, multilingual personal portfolio website built with Next.js 14, featuring smooth animations, internationalization support, and a beautiful design.

## ✨ Features

- 🌍 **Internationalization (i18n)** - Support for multiple languages with i18next
- 🎨 **Smooth Animations** - Powered by Framer Motion and GSAP
- 📱 **Responsive Design** - Tailwind CSS for mobile-first design
- 🎯 **SEO Optimized** - Server-side rendering with Next.js
- 🗃️ **Database Integration** - Prisma ORM with PostgreSQL
- 🎭 **Modern UI** - Mantine components library
- 🔥 **Hot Reload** - Fast development experience

## 🛠️ Tech Stack

### Core

- **Next.js 14** - React framework with SSR/SSG
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **SASS** - CSS preprocessor

### UI & Animations

- **Mantine UI** - React components library
- **Framer Motion** - React animation library
- **GSAP** - Professional-grade animation
- **clsx** / **tailwind-merge** - Class name utilities

### Internationalization

- **i18next** - Internationalization framework
- **react-i18next** - React bindings for i18next
- **next-i18n-router** - i18n routing for Next.js
- **i18next-browser-languagedetector** - Language detection

### Database

- **Prisma** - Next-generation ORM
- **PostgreSQL** - Database
- **@repo/prisma** - Shared Prisma schema

### Forms & Validation

- **React Hook Form** - Form management
- **@hookform/resolvers** - Validation resolvers

### Development

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **@repo/eslint-config** - Shared ESLint config

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.0
- Yarn or npm
- PostgreSQL database

### Installation

1. **Navigate to the portfolio directory:**

   ```bash
   cd apps/portfolio
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
   DATABASE_URL="postgresql://user:password@localhost:5432/portfolio"
   POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/portfolio"
   ```

4. **Generate Prisma client:**

   ```bash
   npx prisma generate
   ```

5. **Run migrations (if any):**

   ```bash
   npx prisma migrate dev
   ```

6. **Start development server:**

   ```bash
   yarn dev
   ```

7. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 📜 Available Scripts

| Script           | Description                  |
| ---------------- | ---------------------------- |
| `yarn dev`       | Start development server     |
| `yarn build`     | Build for production         |
| `yarn start`     | Start production server      |
| `yarn lint`      | Run ESLint                   |
| `yarn lint:fix`  | Fix ESLint errors and format |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn format`    | Format code with Prettier    |

## 📁 Project Structure

```
portfolio/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Localized routes
│   ├── components/        # React components
│   ├── utils/             # Utility functions
│   ├── constants.ts       # Constants
│   ├── context.ts         # React contexts
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── types.ts           # TypeScript types
├── public/                # Static files
├── i18n-config.ts         # i18n configuration
├── middleware.js          # Next.js middleware
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## 🌍 Internationalization

The portfolio supports multiple languages. Language files are loaded dynamically using `i18next-resources-to-backend`.

### Adding a New Language

1. Create translation files in your locale directory
2. Update `i18n-config.ts` with the new locale
3. Add language detection logic if needed

### Changing Language

The language is detected automatically based on:

- User's browser settings
- URL locale parameter
- Saved preference in cookies

## 🎨 Styling

### Tailwind CSS

Utility-first CSS framework for rapid UI development:

```tsx
<div className='flex items-center justify-center p-4 bg-gray-100'>
  <h1 className='text-2xl font-bold text-blue-600'>Hello World</h1>
</div>
```

### SASS/SCSS

For more complex styles, use SCSS modules:

```scss
.container {
  @apply flex items-center;

  &:hover {
    transform: scale(1.05);
  }
}
```

### Mantine UI

Pre-built components with Tailwind integration:

```tsx
import { Button } from '@mantine/core';

<Button variant='filled'>Click me</Button>;
```

## 🎭 Animations

### Framer Motion

Declarative animations for React:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### GSAP

Advanced timeline animations:

```tsx
gsap.to('.element', {
  x: 100,
  duration: 1,
  ease: 'power2.out',
});
```

## 🗃️ Database

This app uses Prisma with PostgreSQL. The schema is shared via `@repo/prisma` package.

### Common Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 📦 Shared Packages

This app uses shared packages from the monorepo:

- **@repo/prisma** - Shared database schema and Prisma client
- **@repo/utils** - Shared utility functions
- **@repo/eslint-config** - Shared ESLint configuration

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### Build Command

```bash
yarn build
```

## 🐛 Debugging

### TypeScript Errors

```bash
yarn typecheck
```

### Linting Issues

```bash
yarn lint:fix
```

### Clear Next.js Cache

```bash
rm -rf .next
yarn dev
```

## 📝 License

Part of the Portfolio Monorepo - MIT License

## 🤝 Contributing

See the [main repository README](../../README.md) for contribution guidelines.

---

Built with ❤️ using Next.js and modern web technologies
