# DealersCloud Web Dashboard

Modern React web dashboard for automotive dealership management.

## Features

- **Dashboard Analytics**: Real-time KPI tracking and business insights
- **Vehicle Management**: Complete CRUD operations for inventory
- **CRM System**: Lead management and customer relationship tools
- **Real-time Messaging**: Socket.IO powered communication
- **Document Management**: File upload, categorization, and sharing
- **User Management**: Role-based access control
- **Responsive Design**: Material-UI with mobile-first approach

## Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **State Management**: Redux Toolkit, React Query
- **Real-time**: Socket.IO Client
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Routing**: React Router v6

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # Redux store configuration
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles and theme
```

## Environment Variables

Create a `.env` file with:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## API Integration

The web dashboard connects to the DealersCloud backend API for:
- Authentication and user management
- Vehicle inventory operations
- CRM and lead management
- Real-time messaging
- Document upload and management
- Dashboard analytics

## Contributing

1. Follow the component structure and naming conventions
2. Use TypeScript for all new code
3. Write tests for new features
4. Follow ESLint rules
5. Update documentation for new features
