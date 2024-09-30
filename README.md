# My Monorepo with Turborepo

This is a monorepo built using [Turborepo](https://turbo.build/). It contains multiple pet projects, starting with my
personal portfolio and expanding to other projects over time.

## Project Structure

- `/portfolio` – My personal portfolio.
- More pet projects will be added soon.

## Getting Started

To run this repository, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/yourusername/your-monorepo.git
```

2. Navigate to the project directory:

```bash
cd your-monorepo
```

3. Install the dependencies:

```bash
yarn install
```

4. Run the development server:

```bash
yarn dev
```

## Tech Stack

This project uses a modern stack for building responsive and interactive web applications. Here is an overview of the
main technologies and tools used in the `portfolio` project:

### Frontend

- **React 18**: Library for building user interfaces.
- **Next.js 14**: Framework for server-rendered React applications with great SEO and performance optimizations.
- **TypeScript**: Strictly typed JavaScript for better developer experience and maintainability.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **SASS**: CSS pre-processor for more powerful and maintainable styles.

### Internationalization

- **i18next**: Framework for managing translations and localization.
- **react-i18next**: React integration for i18next.
- **next-i18next**: Next.js plugin for i18n management.

### Animations

- **Framer Motion**: Animations and transitions for React components.
- **GSAP**: High-performance animations library for more complex animations.

### Forms & Hooks

- **@hookform/resolvers**: Validation resolver for React Hook Form.
- **@mantine/hooks**: Collection of React hooks for UI components.
- **usehooks-ts**: React hooks written in TypeScript.

### Icons & Images

- **Country Flag Icons**: SVG icons for country flags.
- **file-loader**: Module for importing and using image and video files.

### Linting & Formatting

- **ESLint**: Tool for identifying and fixing problems in JavaScript/TypeScript code.
- **Prettier**: Code formatter to maintain a consistent code style.
- **Tailwind CSS Plugin**: Linting and sorting of Tailwind CSS classes.

### Utilities

- **clsx**: Utility for conditionally joining class names.
- **js-cookie**: JavaScript API for handling cookies.
- **tailwind-merge**: Utility to merge Tailwind CSS classes without conflicts.

### Development Tools

- **Turborepo**: High-performance build system for monorepos.
- **TypeScript**: Provides static type-checking.
- **Prettier**: Code formatting tool.
- **ESLint**: For linting and enforcing coding standards.

### Build and Deployment

- **Next.js Build Tools**: Commands for building, starting, and linting the project.
- **Autoprefixer**: Adds vendor prefixes to CSS for better browser support.
- **PostCSS**: Tool for transforming CSS with plugins.
