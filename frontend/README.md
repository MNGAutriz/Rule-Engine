# Frontend - Universal Rules Engine Dashboard

A modern, responsive React-based dashboard for managing and monitoring the Universal Rules Engine system. Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**.

## 🎨 User Interface Overview

The frontend provides an intuitive dashboard for:
- **Real-time Rule Management** - Create, edit, and monitor business rules
- **Event Processing** - Test and validate event processing
- **Campaign Management** - Configure and track marketing campaigns
- **Consumer Query** - Search and analyze consumer data
- **Analytics Dashboard** - Performance metrics and insights

## 🚀 Core Features

### 1. Dashboard Overview
- Real-time system statistics
- Rule execution metrics
- Campaign performance overview
- Event processing charts
- System health indicators

### 2. Event Processor
- Interactive event testing
- Real-time event processing
- Response validation
- Event type selection
- Market-specific testing

### 3. Campaign Manager
- Campaign creation and editing
- Rule association
- Performance tracking
- Campaign scheduling
- Multi-market support

### 4. Consumer Query Portal
- **Consumer Query Interface**: Clean, intuitive search interface for looking up consumer data
- **Points Dashboard**: Comprehensive view of consumer points including total, available, and used points
- **Transaction History**: Paginated transaction history with detailed event information
- **Expiration Tracking**: Visual indicators for points expiration status and policies
- **Market Information**: Display of market-specific data with flag icons and timezone information

### User Experience
- **Responsive Design**: Optimized for desktop and mobile viewing
- **Real-time Feedback**: Loading states, error handling, and success indicators
- **Pagination**: Efficient browsing through large transaction histories
- **Search Optimization**: Keyboard shortcuts and instant search capabilities
- **Visual Hierarchy**: Color-coded cards and status indicators for quick data comprehension

## 🏗️ Architecture

```
frontend/
├── index.html                 # Main HTML template
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── public/                   # Static assets
│   └── vite.svg              # Application favicon
└── src/                      # Source code
    ├── main.tsx              # Application entry point
    ├── App.tsx               # Main application component
    ├── index.css             # Global styles
    ├── vite-env.d.ts         # Vite type definitions
    ├── assets/               # Static assets
    ├── components/           # Reusable UI components
    │   ├── common/           # Common utilities
    │   ├── display/          # Display components
    │   ├── layout/           # Layout components
    │   └── ui/               # Base UI components
    ├── lib/                  # Utility libraries
    ├── pages/                # Page components
    └── services/             # API services
```

### Technology Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: Custom component library with consistent design system
- **Icons**: Lucide React for consistent iconography
- **HTTP Client**: Axios for API communication

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🧩 Component Library

### UI Components (`components/ui/`)

#### Button (`button.tsx`)
- Primary, secondary, and outline variants
- Size variations (small, medium, large)
- Loading states and disabled states
- Icon support

#### Card (`card.tsx`)
- Flexible card container with header and content sections
- Customizable styling and responsive design

#### Input (`input.tsx`)
- Form input component with validation states
- Placeholder support and icon integration

#### Select (`select.tsx`)
- Dropdown selection component
- Multi-select capability and search functionality

#### Tabs (`tabs.tsx`)
- Tabbed interface component with keyboard navigation
- Active state management and responsive behavior

### Layout Components (`components/layout/`)

#### PageHeader (`PageHeader.tsx`)
- Consistent page headers with breadcrumb navigation
- Action buttons and responsive layout

### Display Components (`components/display/`)

#### RuleCard (`RuleCard.tsx`)
- Rule information display with status indicators
- Action buttons and edit/delete functionality

#### StatsGrid (`StatsGrid.tsx`)
- Key metrics display with responsive grid layout
- Data visualization and interactive elements

#### StatusBadge (`StatusBadge.tsx`)
- Status indication with color-coded badges
- Various sizes and custom styling

### Common Components (`components/common/`)

#### LoadingButton (`LoadingButton.tsx`)
- Button with loading states and spinner integration
- Disabled during loading with success/error feedback

#### LoadingSpinner (`LoadingSpinner.tsx`)
- Customizable loading indicator with size variations
- Color options and animation control

#### ValidationMessage (`ValidationMessage.tsx`)
- Form validation feedback with error/success messages
- Icon integration and accessible design

## 🌐 API Integration (`services/api.ts`)

### Service Layer Architecture

The frontend communicates with the backend through a centralized API service:

```typescript
// Core API functions
export const api = {
  // Event processing
  processEvent: (eventData: EventData) => Promise<EventResult>,
  
  // Rule management
  getRules: () => Promise<Rule[]>,
  createRule: (rule: Rule) => Promise<Rule>,
  updateRule: (id: string, rule: Rule) => Promise<Rule>,
  deleteRule: (id: string) => Promise<void>,
  
  // Consumer operations
  getConsumer: (id: string) => Promise<Consumer>,
  searchConsumers: (query: SearchQuery) => Promise<Consumer[]>,
  
  // Campaign management
  getCampaigns: () => Promise<Campaign[]>,
  createCampaign: (campaign: Campaign) => Promise<Campaign>,
  updateCampaign: (id: string, campaign: Campaign) => Promise<Campaign>,
  
  // System information
  getSystemStats: () => Promise<SystemStats>,
  getHealthStatus: () => Promise<HealthStatus>
};
```

### HTTP Client Configuration

- **Axios** for HTTP requests
- Request/response interceptors
- Error handling middleware
- Timeout configuration
- Base URL configuration

## 🎨 Styling & Design System

### Tailwind CSS Integration

- **Utility-first** CSS framework
- **Responsive design** patterns
- **Dark mode** support (planned)
- **Custom color palette**
- **Component variants**

### Design Tokens

```css
/* Color System */
--primary: #2563eb;
--primary-foreground: #ffffff;
--secondary: #f1f5f9;
--secondary-foreground: #334155;
--accent: #10b981;
--accent-foreground: #ffffff;

/* Typography */
--font-sans: 'Inter', sans-serif;
--font-mono: 'Fira Code', monospace;

/* Spacing */
--spacing-unit: 0.25rem;
--container-padding: 1rem;
```

### Responsive Design

- **Mobile-first** approach
- **Breakpoint system** (sm, md, lg, xl, 2xl)
- **Flexible grid** layouts
- **Adaptive navigation**
- **Touch-friendly** interactions

## 📱 User Experience

### Navigation

- **Sidebar navigation** with collapsible menu
- **Breadcrumb navigation** for context
- **Tab-based interfaces** for complex pages
- **Mobile-responsive** navigation drawer

### Interactions

- **Real-time updates** via API polling
- **Form validation** with immediate feedback
- **Loading states** for async operations
- **Success/error notifications**
- **Keyboard shortcuts** for power users

### Accessibility

- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus management**
- **Semantic HTML** structure

## 🔧 Development Tools

### TypeScript Configuration

- **Strict mode** enabled
- **Path aliases** for imports
- **Type checking** in development
- **Build-time validation**

### ESLint Configuration

- **React hooks** rules
- **TypeScript** specific rules
- **Import/export** validation
- **Code formatting** standards

### Vite Configuration

- **Hot module replacement**
- **Fast builds** with esbuild
- **Asset optimization**
- **Environment variables**
- **Proxy configuration** for API

## 🚀 Production Optimization

### Build Optimization

- **Code splitting** for optimal loading
- **Tree shaking** for unused code removal
- **Asset optimization** and compression
- **Bundle analysis** for size monitoring

### Performance Features

- **Lazy loading** for components
- **Image optimization**
- **Caching strategies**
- **Memory leak prevention**

## 🔌 Integration Points

### Backend API Integration

- **RESTful API** communication
- **Error handling** and retry logic
- **Authentication** integration ready
- **Real-time updates** capability

### External Services

- **Analytics** integration points
- **Monitoring** service hooks
- **CDN** asset delivery
- **Authentication** providers

## 🎯 Future Enhancements

### Planned Features

- **Real-time notifications** via WebSocket
- **Advanced filtering** and search
- **Data visualization** charts
- **Export/import** functionality
- **Multi-language** support

### Technical Improvements

- **Progressive Web App** capabilities
- **Offline mode** support
- **Advanced caching** strategies
- **Performance monitoring** integration

---

## 📞 Support & Documentation

For detailed component documentation and usage examples, refer to the component source files and the main project README.md.

For development questions and troubleshooting, check the browser console or enable debug logging in the development environment.
