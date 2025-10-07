# Card Management System - Frontend

A modern React frontend for the Card Management System that demonstrates MuleSoft integration capabilities for financial services.

## Features

- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first design that works on all devices
- **Authentication**: Secure login with JWT token management
- **Card Management**: View, lock/unlock, and control cards
- **Transaction History**: View and filter transaction history
- **Alerts**: Manage notifications and alert preferences
- **Disputes**: Submit and track transaction disputes
- **Card Services**: PIN management, card replacement, activation
- **Real-time Updates**: Live data synchronization with backend

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 3000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## Demo Credentials

```
Email: sarah.demo@example.com
Password: Demo123!

Email: john.demo@example.com
Password: Demo123!

Email: emma.demo@example.com
Password: Demo123!
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context (Auth)
├── pages/              # Page components
├── services/           # API client services
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
├── App.jsx             # Main app component with routing
├── main.jsx            # React app entry point
└── index.css           # Global styles and Tailwind
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technology Stack

- **React 18** - UI library with hooks
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## Key Components

### Authentication
- `AuthContext` - Global authentication state management
- `LoginPage` - User login with form validation
- Protected routes with automatic redirects

### Layout
- `Layout` - Main app layout with sidebar navigation
- Responsive design with mobile menu
- User profile and logout functionality

### Dashboard
- `DashboardPage` - Overview of cards, transactions, and alerts
- Real-time stats and quick actions
- Card lock/unlock functionality

## API Integration

The frontend communicates with the backend API through the `services/api.js` module:

```javascript
import { cardsAPI, transactionsAPI, alertsAPI } from './services/api';

// Get all cards
const cards = await cardsAPI.getCards();

// Lock a card
await cardsAPI.lockCard(cardId, reason);

// Get transactions
const transactions = await transactionsAPI.getCardTransactions(cardId);
```

## Styling

The app uses Tailwind CSS with custom components:

```css
/* Custom button styles */
.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}

/* Custom card styles */
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `src/App.jsx`
3. Add navigation link to `src/components/Layout.jsx`

### Adding New API Calls

1. Add the function to `src/services/api.js`
2. Use the function in your components
3. Handle loading states and errors

### Styling Guidelines

- Use Tailwind utility classes
- Follow the design system in `src/index.css`
- Use semantic color names (primary, success, warning, danger)
- Maintain consistent spacing and typography

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test your changes thoroughly
