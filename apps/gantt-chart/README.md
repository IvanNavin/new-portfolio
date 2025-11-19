# 📅 Gantt Chart - Interactive Project Timeline

An interactive Gantt chart application built with React and TypeScript, perfect for visualizing project timelines, tasks, and milestones.

## ✨ Features

- 📊 **Interactive Timeline** - Drag and drop tasks
- 🎨 **Visual Design** - Clean and modern interface
- 📱 **Responsive** - Works on all devices
- 🔄 **Real-time Updates** - Instant feedback
- 💾 **Data Persistence** - Save your projects
- 🎯 **TypeScript** - Full type safety

## 🛠️ Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Create React App (CRA)** - Build tooling
- **CRACO** - CRA configuration override

### Testing
- **Jest** - Testing framework
- **@testing-library/react** - React testing utilities
- **@testing-library/user-event** - User interaction testing
- **@testing-library/jest-dom** - Custom Jest matchers

### Development
- **ESLint** - Code linting
  - `eslint-plugin-jest` - Jest-specific linting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.0
- Yarn or npm

### Installation

1. **Navigate to the gantt-chart directory:**
   ```bash
   cd apps/gantt-chart
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Start development server:**
   ```bash
   yarn dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server (alias for start) |
| `yarn start` | Start development server with CRACO |
| `yarn build` | Build for production |
| `yarn test` | Run tests in watch mode |
| `yarn eject` | Eject from CRA (irreversible!) |

## 📁 Project Structure

```
gantt-chart/
├── public/                # Static files
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/                   # Source code
│   ├── components/       # React components
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── styles/           # CSS/SCSS files
│   ├── App.tsx           # Main app component
│   ├── App.css           # App styles
│   ├── index.tsx         # Entry point
│   └── setupTests.ts     # Test setup
├── craco.config.js       # CRACO configuration
├── tsconfig.json         # TypeScript configuration
├── vercel.json           # Vercel deployment config
└── package.json
```

## 🧪 Testing

This app includes comprehensive testing setup:

### Running Tests

```bash
# Run all tests in watch mode
yarn test

# Run tests once (CI mode)
CI=true yarn test

# Run tests with coverage
yarn test --coverage
```

### Writing Tests

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders gantt chart', () => {
  render(<App />);
  const element = screen.getByText(/gantt/i);
  expect(element).toBeInTheDocument();
});

test('adds new task', async () => {
  const user = userEvent.setup();
  render(<App />);
  
  const button = screen.getByRole('button', { name: /add task/i });
  await user.click(button);
  
  expect(screen.getByText(/new task/i)).toBeInTheDocument();
});
```

### Test Coverage

The project uses Jest for testing with the following matchers:
- `toBeInTheDocument()` - Element is present
- `toHaveClass()` - Element has CSS class
- `toHaveStyle()` - Element has inline styles
- `toBeVisible()` - Element is visible

## ⚙️ CRACO Configuration

Uses **CRACO** to customize CRA without ejecting:

```javascript
// craco.config.js
module.exports = {
  // Custom webpack configuration
  webpack: {
    configure: (webpackConfig) => {
      // Modifications here
      return webpackConfig;
    },
  },
  // Jest configuration
  jest: {
    configure: (jestConfig) => {
      // Test modifications here
      return jestConfig;
    },
  },
};
```

## 🎨 Styling

The app uses CSS/SCSS for styling:

```css
/* App.css */
.gantt-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
}

.timeline {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.task {
  padding: 10px;
  border-radius: 4px;
  background: #f0f0f0;
  cursor: pointer;
  transition: transform 0.2s;
}

.task:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

## 📦 Build for Production

### Create Production Build

```bash
yarn build
```

This creates an optimized production build in the `build/` directory.

### Build Output

- Minified and optimized JavaScript
- CSS extracted and minified
- Static assets with hashed filenames
- Source maps for debugging

## 🌐 Deployment

### Vercel

The app includes `vercel.json` configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ]
}
```

Deploy:
```bash
vercel --prod
```

### Other Platforms

The build output in `build/` can be deployed to:
- GitHub Pages
- Netlify
- AWS S3
- Any static hosting service

## 🔧 ESLint Configuration

Custom ESLint rules for Jest testing:

```json
{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "plugins": ["jest"]
}
```

## 🎯 TypeScript

Full TypeScript support with strict mode:

```typescript
// Task type
interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies?: string[];
}

// Component props
interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Use a different port
PORT=3001 yarn start
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules build
yarn install
```

### Test Failures

```bash
# Update snapshots
yarn test -u
```

### Build Errors

```bash
# Check TypeScript errors
npx tsc --noEmit
```

## 📝 License

Part of the Portfolio Monorepo - MIT License

## 🤝 Contributing

See the [main repository README](../../README.md) for contribution guidelines.

---

Built with ❤️ using React and TypeScript
