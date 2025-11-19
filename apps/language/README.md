# 🌐 Language Learning Platform

A modern language learning platform built with Next.js 14, featuring Google Translate API integration, authentication, and database persistence for tracking your learning progress.

## ✨ Features

- 🔐 **Authentication** - Secure login with NextAuth.js
- 🌍 **Google Translate Integration** - Powered by Google Translate API
- 📚 **Progress Tracking** - Save and track your learning progress
- 🗃️ **Database Persistence** - SQLite/PostgreSQL with Prisma
- 📱 **Responsive Design** - Mobile-first approach
- 🔒 **HTTPS Development** - Secure local development
- 🎯 **TypeScript** - Full type safety

## 🛠️ Tech Stack

### Core
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **SQLite** / **PostgreSQL** - Database

### Authentication
- **NextAuth.js** - Authentication solution
- **Google OAuth** - Social authentication
- **Google Auth Library** - Google authentication

### Translation
- **google-translate-api-x** - Google Translate API wrapper
- Supports 100+ languages
- Text translation and language detection

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **SASS** - CSS preprocessor
- **@mantine/hooks** - Useful React hooks
- **tailwind-merge** - Smart class merging
- **clsx** - Class name utility

### Utilities
- **js-cookie** - Cookie management
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
- Google Cloud account (for Translate API)
- Google OAuth credentials (for authentication)

### Installation

1. **Navigate to the language directory:**
   ```bash
   cd apps/language
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Setup environment variables:**
   ```bash
   # Create .env file
   cp .env.example .env
   ```

   Add the following variables:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   # or for PostgreSQL:
   # DATABASE_URL="postgresql://user:password@localhost:5432/language"
   POSTGRES_PRISMA_URL="postgresql://..."
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="https://localhost:3000"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Google Translate API
   GOOGLE_TRANSLATE_API_KEY="your-api-key"
   ```

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

5. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

6. **Start development server with HTTPS:**
   ```bash
   yarn dev
   ```

7. **Open your browser:**
   ```
   https://localhost:3000
   ```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server with HTTPS |
| `yarn build` | Build for production (includes Prisma generation) |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Fix ESLint errors and format code |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn format` | Format code with Prettier |

## 📁 Project Structure

```
language/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API routes
│   │   │   └── auth/     # NextAuth routes
│   │   ├── components/   # React components
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── apis/             # API client functions
│   ├── components/       # Shared components
│   ├── containers/       # Page containers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Library code
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── assets/           # Static assets
├── public/               # Static files
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── postcss.config.mjs    # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## 🔐 Authentication

This app uses **NextAuth.js** for authentication:

### Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

### Using Authentication

```tsx
import { useSession, signIn, signOut } from 'next-auth/react';

function Component() {
  const { data: session } = useSession();
  
  if (session) {
    return (
      <>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  
  return (
    <button onClick={() => signIn('google')}>Sign in with Google</button>
  );
}
```

## 🌍 Translation API

### Google Translate Integration

```typescript
// Example usage
import { translate } from '@/apis/translate';

const result = await translate({
  text: 'Hello, world!',
  to: 'uk', // Ukrainian
  from: 'en' // English (optional, auto-detect if not provided)
});

console.log(result.text); // "Привіт, світ!"
```

### Supported Languages

The API supports 100+ languages including:
- English (en)
- Ukrainian (uk)
- Spanish (es)
- French (fr)
- German (de)
- And many more...

## 🗃️ Database

Uses **Prisma** with SQLite for development and PostgreSQL for production.

### Common Models

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  words     Word[]
}

model Word {
  id          String   @id @default(cuid())
  original    String
  translation String
  language    String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}
```

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 🔒 HTTPS Development

This app runs with HTTPS in development mode (`--experimental-https`).

### Why HTTPS in Development?

- OAuth providers require HTTPS
- Service workers require HTTPS
- Testing production-like environment

### Certificate Issues?

Your browser may show a security warning for the self-signed certificate. This is normal for development. Click "Advanced" and "Proceed to localhost".

## 📦 Shared Packages

This app uses shared packages from the monorepo:

- **@repo/prisma** - Shared database schema and Prisma client
- **@repo/utils** - Shared utility functions

## 🎨 Styling

### Tailwind CSS

```tsx
<div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50">
  <h2 className="text-xl font-bold text-blue-900">Translation</h2>
</div>
```

### SASS/SCSS

For complex styles:

```scss
.translation-card {
  @apply p-4 rounded-lg shadow-md;
  
  &:hover {
    @apply shadow-lg;
    transform: translateY(-2px);
  }
}
```

## 🌐 API Routes

### Translation Endpoint

```typescript
// app/api/translate/route.ts
export async function POST(request: Request) {
  const { text, to, from } = await request.json();
  
  const result = await translateText({
    text,
    targetLang: to,
    sourceLang: from
  });
  
  return Response.json(result);
}
```

### Authentication Endpoint

NextAuth automatically creates routes at `/api/auth/*`:
- `/api/auth/signin` - Sign in page
- `/api/auth/signout` - Sign out
- `/api/auth/session` - Get session
- `/api/auth/callback/google` - OAuth callback

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   ```
   DATABASE_URL
   POSTGRES_PRISMA_URL
   NEXTAUTH_SECRET
   NEXTAUTH_URL
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   GOOGLE_TRANSLATE_API_KEY
   ```
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
NEXTAUTH_SECRET="random-secret-string"
NEXTAUTH_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_TRANSLATE_API_KEY="..."
```

## 🐛 Troubleshooting

### OAuth Redirect Error

Make sure your Google OAuth redirect URIs match your NEXTAUTH_URL.

### Prisma Client Not Found

```bash
npx prisma generate
```

### HTTPS Certificate Warning

This is normal for development. Proceed to localhost in your browser.

### Translation API Error

Check your GOOGLE_TRANSLATE_API_KEY and ensure the API is enabled in Google Cloud Console.

## 📝 License

Part of the Portfolio Monorepo - MIT License

## 🤝 Contributing

See the [main repository README](../../README.md) for contribution guidelines.

---

Built with ❤️ using Next.js and Google Cloud APIs