# 🎯 Portfolio Monorepo

[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-blueviolet.svg)](https://turbo.build/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A high-performance monorepo built with [Turborepo](https://turbo.build/) containing a collection of web applications and shared packages. This repository demonstrates modern web development practices with Next.js, React, TypeScript, and Prisma.

## 📦 What's Inside?

### Applications (`apps/`)

| Application                                     | Description | Tech Stack | Status |
|-------------------------------------------------|-------------|------------|--------|
| [**portfolio**](./apps/portfolio)               | Personal portfolio website with i18n | Next.js 14, i18next, Framer Motion, GSAP | ✅ Active |
| [**im-bruhl**](./apps/im-bruhl)                 | Task management application | Next.js 14, Mantine UI, Prisma | ✅ Active |
| [**language**](./apps/language)                 | Language learning platform | Next.js 14, NextAuth, Google Translate API | ✅ Active |
| [**pokedex**](./apps/pokedex)                   | Pokémon encyclopedia | Next.js 14, Mantine UI, Prisma | ✅ Active |
| [**visit-stat**](./apps/visit-stat)             | Visitor statistics dashboard | Next.js 15, Mantine React Table | ✅ Active |
| [**gantt-chart**](./apps/gantt-chart)           | Interactive Gantt chart tool | React 18, CRA, TypeScript | ✅ Active |
| [**2048**](./apps/2048)                         | Classic 2048 game | Vanilla JS, HTML, CSS | 🎮 Game |
| [**destructurizator**](./apps/destructurizator) | Text destructuring tool | Vanilla JS, Chance.js | 🛠️ Tool |
| [**miner**](./apps/miner)                       | Minesweeper game | Vanilla JS modules | 🎮 Game |
| [**snake**](./apps/snake)                       | Snake game | Vanilla JS | 🎮 Game |
| [**solitaire**](./apps/solitaire)               | Solitaire card game | Vanilla JS | 🎮 Game |
| [**rpg-game**](./apps/rpg-game)                 | RPG game prototype | Next.js | 🚧 WIP |

### Shared Packages (`packages/`)

| Package | Description | Version |
|---------|-------------|---------|
| `@repo/prisma` | Shared Prisma schema and client | 1.0.0 |
| `@repo/utils` | Shared utility functions | 1.0.0 |
| `@repo/eslint-config` | Shared ESLint configuration | 1.0.0 |

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.19.0
- **Yarn** 1.22.19 (recommended) or npm
- **PostgreSQL** (for apps using Prisma)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/IvanNavin/new-portfolio.git
   cd new-portfolio
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Setup environment variables:**
   ```bash
   # Copy .env.example to .env in each app that needs it
   # Configure database URLs and API keys
   ```

4. **Generate Prisma client:**
   ```bash
   yarn generate:prisma
   ```

5. **Run development servers:**
   ```bash
   # Run all apps in development mode
   yarn dev
   
   # Or run a specific app
   yarn dev --filter=portfolio
   ```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start all apps in development mode |
| `yarn build` | Build all apps for production |
| `yarn lint` | Lint all apps and packages |
| `yarn typecheck` | Type-check all TypeScript files |
| `yarn format` | Format code with Prettier |
| `yarn clean` | Clean build artifacts |
| `yarn generate:prisma` | Generate Prisma client |

### Running Specific Apps

```bash
# Development
yarn dev --filter=portfolio
yarn dev --filter=im-bruhl
yarn dev --filter=language

# Build
yarn build --filter=pokedex
yarn build --filter=visit-stat
```

## 🏗️ Architecture

This monorepo uses **Turborepo** for efficient build orchestration and caching:

```
portfolio/
├── apps/                    # Application projects
│   ├── portfolio/          # Next.js apps with various features
│   ├── im-bruhl/
│   ├── language/
│   ├── pokedex/
│   ├── visit-stat/
│   ├── gantt-chart/        # React CRA app
│   └── [games]/            # Vanilla JS games
├── packages/               # Shared packages
│   ├── prisma/            # Shared database schema
│   ├── utils/             # Utility functions
│   └── config-eslint/     # ESLint configuration
├── turbo.json             # Turborepo configuration
└── package.json           # Root package.json
```

### Task Pipeline

Turborepo manages these tasks with optimized caching:

- **generate** → **build** → **dev/start**
- **lint**, **typecheck**, **format** run independently
- All tasks cache outputs for faster subsequent runs

## 🛠️ Tech Stack

### Core Technologies

- **[Next.js 14-15](https://nextjs.org/)** - React framework with SSR/SSG
- **[React 18-19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Turborepo](https://turbo.build/)** - Monorepo build system
- **[Prisma](https://www.prisma.io/)** - Database ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Database

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Mantine UI](https://mantine.dev/)** - React components library
- **[SASS/SCSS](https://sass-lang.com/)** - CSS preprocessor
- **[Framer Motion](https://www.framer.com/motion/)** - Animations
- **[GSAP](https://greensock.com/gsap/)** - Advanced animations

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[lint-staged](https://github.com/okonet/lint-staged)** - Run linters on staged files

### Additional Libraries

- **i18next** - Internationalization
- **NextAuth.js** - Authentication
- **React Hook Form** - Form management
- **Google Translate API** - Translation services

## 🌍 Environment Variables

Each app may require different environment variables. Create a `.env` file in each app directory:

```env
# Database (for apps using Prisma)
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."

# Authentication (for language app)
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# APIs
GOOGLE_TRANSLATE_API_KEY="..."
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Run `yarn lint` and `yarn typecheck` before committing
- Use conventional commits
- Write meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Ivan Navin**

- GitHub: [@IvanNavin](https://github.com/IvanNavin)
- Repository: [new-portfolio](https://github.com/IvanNavin/new-portfolio)

## 🙏 Acknowledgments

- Built with [Turborepo](https://turbo.build/)
- UI components from [Mantine](https://mantine.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Database with [Prisma](https://www.prisma.io/)

---

<p align="center">Made with ❤️ by Ivan Navin</p>
