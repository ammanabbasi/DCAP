# DealersCloud - Full-Stack Automotive Dealership Management Platform

![React Native](https://img.shields.io/badge/React%20Native-0.75.2-blue)
![React](https://img.shields.io/badge/React-18.3+-blue)
![Express.js](https://img.shields.io/badge/Express.js-4.21+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8+-black)

## 🚀 Overview

**DealersCloud** is a comprehensive, full-stack automotive dealership management platform designed to streamline CRM operations, inventory management, and real-time communication for automotive businesses. Built with modern web and mobile technologies, it provides a complete solution across mobile, web, and backend systems.

> **🌟 Complete Platform**: Mobile app (React Native), Web dashboard (React), and Backend API (Express.js) - all working together seamlessly.

## ✨ Platform Features

### 📱 **Mobile App (React Native)**
- **Real-time CRM**: Lead management and customer tracking
- **Inventory Management**: Vehicle CRUD with image uploads
- **Live Messaging**: Socket.IO powered real-time communication
- **Document Handling**: Camera capture and file management
- **Offline Support**: Redux Persist with MMKV storage
- **Modern UI**: React Navigation 7 with custom components

### 🌐 **Web Dashboard (React)**
- **Analytics Dashboard**: Interactive charts with business insights
- **Vehicle Management**: Complete inventory operations
- **CRM Tools**: Lead pipeline and customer management
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Material-UI with mobile-first approach
- **Advanced Filtering**: Search and filter across all data

### ⚙️ **Backend API (Express.js)**
- **RESTful API**: Complete CRUD operations for all resources
- **Real-time Communication**: WebSocket connections via Socket.IO
- **JWT Authentication**: Secure token-based auth with refresh
- **File Upload**: Multipart upload with Azure Storage integration
- **Security**: Rate limiting, input validation, CORS protection
- **Database**: SQL Server with Knex query builder

## 🏗️ Architecture

### Project Structure
```
dealerscloud-platform/
├── mobile/                    # React Native mobile app
│   ├── src/
│   │   ├── Components/        # Reusable UI components
│   │   ├── Screens/           # All app screens (40+ screens)
│   │   ├── Navigation/        # React Navigation setup
│   │   ├── redux/             # Redux store and slices
│   │   ├── Services/          # API services
│   │   ├── Assets/            # Images, icons, fonts
│   │   └── Utils/             # Helper functions
│   ├── package.json
│   └── App.tsx
├── web/                       # React web dashboard
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store
│   │   └── types/             # TypeScript definitions
│   └── package.json
├── backend/                   # Express.js API server
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── middleware/        # Authentication, validation
│   │   ├── models/            # Database models
│   │   ├── utils/             # Logger, helpers
│   │   └── server.ts          # Main server file
│   └── package.json
├── package.json               # Root package with workspaces
└── README.md
```

### Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Mobile** | React Native 0.75.2, TypeScript, Redux Toolkit, React Navigation 7, Socket.IO Client |
| **Web** | React 18, TypeScript, Material-UI, Redux Toolkit, React Query, Recharts |
| **Backend** | Express.js 4.21, TypeScript, Socket.IO, JWT, Knex, SQL Server |
| **Database** | SQL Server 2022, Redis (caching), Azure Blob Storage (files) |
| **Real-time** | Socket.IO for live messaging and updates |
| **Testing** | Jest, React Testing Library, Supertest |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+
- SQL Server 2022
- React Native CLI (for mobile development)

### Installation

```bash
# Clone the repository
git clone https://github.com/ammanabbasi/DCAP.git
cd DCAP

# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp web/.env.example web/.env
cp mobile/.env.example mobile/.env

# Start all services in development
npm run dev
```

### Individual Services

```bash
# Backend API (runs on :5000)
npm run dev:backend

# Web Dashboard (runs on :3000)
npm run dev:web

# Mobile App (React Native)
npm run dev:mobile
```

## 📊 Features Deep Dive

### CRM & Lead Management
- **Lead Pipeline**: Visual pipeline with drag-drop functionality
- **Customer Profiles**: Complete customer history and interactions
- **Follow-up System**: Automated reminders and task management
- **Conversion Tracking**: Lead source analysis and ROI metrics
- **Email Integration**: SendGrid integration for automated emails

### Vehicle Inventory
- **Complete CRUD**: Add, edit, delete, and manage vehicle listings
- **Image Management**: Multiple image uploads with gallery view
- **Advanced Search**: Filter by make, model, year, price, etc.
- **Inventory Analytics**: Aging reports and turnover analysis
- **VIN Decoding**: Automatic vehicle information lookup

### Real-time Communication
- **Live Messaging**: Instant messaging between team members
- **Conversation Management**: Organized chat history
- **File Sharing**: Document and image sharing in chats
- **Typing Indicators**: Real-time typing status
- **Online Status**: User presence and availability

### Analytics & Reporting
- **Sales Dashboard**: Real-time sales metrics and KPIs
- **Interactive Charts**: Revenue trends and performance analysis
- **Custom Reports**: Exportable reports in PDF/Excel formats
- **Goal Tracking**: Set and monitor business objectives
- **Data Export**: CSV/Excel export capabilities

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev                    # Start all services
npm run dev:backend           # Backend only
npm run dev:web              # Web only
npm run dev:mobile           # Mobile only

# Building
npm run build                 # Build all for production
npm run build:backend        # Build backend
npm run build:web           # Build web

# Testing
npm run test                 # Run all tests
npm run test:backend        # Backend tests
npm run test:web           # Web tests
npm run test:mobile        # Mobile tests

# Linting
npm run lint                # Lint all projects
npm run lint:fix           # Fix linting issues
```

### API Endpoints

The backend provides comprehensive REST API endpoints:

- **Authentication**: `/api/auth/*` - Login, register, refresh tokens
- **Vehicles**: `/api/vehicles/*` - Complete vehicle CRUD operations
- **CRM**: `/api/crm/*` - Lead and customer management
- **Dashboard**: `/api/dashboard/*` - Analytics and statistics
- **Messaging**: `/api/messaging/*` - Real-time messaging
- **Documents**: `/api/documents/*` - File upload and management

## 📱 Mobile App Features

### React Native Advantages
- **Cross-platform**: Single codebase for iOS and Android
- **Native Performance**: Optimized performance on mobile devices
- **Real-time Updates**: Socket.IO integration for live data
- **Offline Support**: Redux Persist with MMKV for offline functionality
- **Camera Integration**: Document scanning and image capture
- **Push Notifications**: Firebase integration ready

### Key Mobile Screens
- Dashboard with analytics
- Vehicle inventory management
- CRM and lead management
- Real-time messaging
- Document management
- User profile and settings

## 🌐 Web Dashboard Features

### React Web Advantages
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Material-UI**: Professional and consistent design system
- **Data Visualization**: Interactive charts and graphs
- **Advanced Tables**: Sorting, filtering, and pagination
- **Real-time Updates**: Live data synchronization
- **Export Capabilities**: PDF and Excel report generation

### Key Dashboard Pages
- Business analytics dashboard
- Vehicle inventory management
- CRM pipeline visualization
- Real-time messaging interface
- Document repository
- User and role management

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Granular permissions system
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API rate limiting protection
- **CORS Security**: Cross-origin resource sharing protection
- **File Upload Security**: Secure file handling and validation
- **Password Hashing**: Bcrypt password encryption
- **Environment Variables**: Secure configuration management

## 📈 Performance Optimizations

### Mobile App
- **Redux Persist**: Offline data caching
- **MMKV Storage**: High-performance storage solution
- **Image Caching**: Efficient image loading and caching
- **Lazy Loading**: On-demand component loading
- **Memory Management**: Optimized memory usage

### Web Dashboard
- **Code Splitting**: Lazy-loaded routes and components
- **React Query**: Intelligent data fetching and caching
- **Virtual Scrolling**: Efficient large list rendering
- **Memoization**: Component and calculation optimization
- **Bundle Optimization**: Webpack optimization

### Backend API
- **Connection Pooling**: Optimized database connections
- **Redis Caching**: Fast in-memory caching
- **Compression**: Response compression middleware
- **Request Optimization**: Efficient query handling
- **File Streaming**: Optimized file upload/download

## 🧪 Testing Strategy

### Unit Testing
- **Jest**: Testing framework for all components
- **React Testing Library**: Component testing for React
- **Supertest**: API endpoint testing
- **Coverage Reports**: Comprehensive test coverage

### Integration Testing
- **API Testing**: End-to-end API workflow testing
- **Database Testing**: Database integration tests
- **Socket Testing**: Real-time functionality testing

## 🚀 Deployment

### Production Deployment Options

#### Backend (Express.js)
- **Docker**: Containerized deployment
- **PM2**: Process management
- **Azure App Service**: Cloud hosting
- **Load Balancing**: Multiple instance support

#### Web Dashboard (React)
- **Static Hosting**: Netlify, Vercel, Azure Static Web Apps
- **CDN**: Global content delivery
- **Environment Configuration**: Production environment setup

#### Mobile App (React Native)
- **App Store**: iOS App Store deployment
- **Google Play**: Android Google Play deployment
- **CodePush**: Over-the-air updates
- **Beta Testing**: TestFlight and Google Play Console

## 📖 Documentation

- **API Documentation**: Complete API reference with examples
- **Component Documentation**: Storybook for UI components
- **Database Schema**: ERD and table documentation
- **Deployment Guide**: Step-by-step deployment instructions
- **Contributing Guide**: Development setup and guidelines

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use ESLint and Prettier for code formatting
- Follow conventional commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community for excellent mobile framework
- React team for the powerful web framework
- Express.js for the robust backend framework
- Material-UI for the beautiful component library
- Socket.IO for real-time communication capabilities

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the FAQ section

---

**Built with ❤️ by the DealersCloud Team**

*Revolutionizing automotive dealership management with modern technology*