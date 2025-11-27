# Overview

This is a transparency and management system for SEMAPA (Secretaria Municipal de Agricultura, Pesca e Abastecimento) in Vitória do Xingu, Pará, Brazil. The platform provides public access to agricultural data, fisheries information, and food assistance programs (PAA), while also offering administrative tools for different municipal departments.

The system features:
- Public-facing pages displaying agricultural statistics, charts, and media
- Interactive maps showing agricultural activities
- Chatbot for citizen engagement
- Department-specific admin panels (Agriculture, Fishing, PAA, Fleet Management)
- Secretary dashboard for high-level oversight
- Donation tracking and event management

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as build tool and dev server
- Tailwind CSS for styling
- Radix UI components for accessible UI primitives
- React Router (wouter) for client-side routing
- TanStack React Query for data fetching and caching
- Framer Motion for animations

**Key Design Patterns:**
- Component-based architecture with reusable UI components in `/client/src/components`
- Custom hooks for Firebase interactions and authentication
- Responsive design with mobile-first approach (breakpoints for tablets at 810px)
- Dynamic chart rendering with Chart.js
- Real-time data updates using Firebase listeners

**Route Structure:**
- Public routes: `/`, `/agriculture`, `/fishing`, `/paa`, `/mapa`
- Admin login routes: `/login/admin-gestor`, `/login/admin/agricultura`, `/login/admin/pesca`, `/login/admin/paa`
- Admin panels: `/admin/agricultura`, `/admin/pesca`, `/admin/paa`, `/admin/secretario`, `/admin/garagem`
- Special routes: `/registrar-doacao` (public donation registration)

## Backend Architecture

**Data Storage:**
- Firebase Firestore as primary database (NoSQL document-based)
- Firebase Storage for media files (images, videos)
- Firebase Authentication for user management

**Authentication & Authorization:**
- Role-based access control with different permission levels
- Sector-specific authentication (agricultura, pesca, paa, admin)
- Auto-registration system for new secretary accounts on first login
- Custom claims and user metadata stored in `usuarios_admin` collection

**Collections Structure:**
- `charts` - Chart configurations and data for visualization
- `media` - Media content (images, videos) with metadata
- `content` - Text content managed through admin panels
- `usuarios_admin` - Admin user accounts with sector permissions
- `doacoes_evento` - Donation tracking linked to events
- `eventos` - Event management
- `insumos` - Agricultural input inventory
- `mapa_atividades` - Map-based activity tracking
- `solicitacoes` - Registration requests
- `pesca_visitas_tecnicas` - Fishing sector technical visits
- `viveiros_em_construcao` - Fish pond construction tracking
- `veiculos` - Fleet management (tractors, vehicles)
- `estatisticas_dinamicas` - Dynamic statistics configuration
- Sector-specific collections for agriculture, fishing, and PAA activities

## Key Features

**Dynamic Statistics System:**
- Real-time animated counters with smooth transitions
- Configurable aggregation types (sum, average, max, count)
- Time-period filtering (today, last 30 days, current month)
- Auto-updating via Firebase listeners with throttled animations

**Chart Management:**
- Support for multiple chart types (bar, line, pie, doughnut, radar)
- Animated chart rendering with organic point-by-point drawing
- Admin interface for creating and editing charts
- Chart ordering and activation controls

**Media Management:**
- Google Drive video integration with custom thumbnails
- Firebase Storage for image hosting
- Vertical and horizontal aspect ratio support
- Rich text editor for media descriptions

**Interactive Map:**
- Google Maps integration via `@react-google-maps/api`
- Polygon and marker support for agricultural activities
- KML/KMZ file upload and parsing
- Real-time activity tracking

**Chatbot Integration:**
- OpenRouter API for AI responses
- Keyword-based response matching
- Multi-tab interface (general chat, agriculture, fishing, PAA)
- Form submission capabilities through chat interface

**Fleet Management Module:**
- Vehicle registration (tractors, trucks, excavators)
- Fuel consumption tracking based on usage
- Maintenance cost recording
- Integration with activity forms (technical visits, pond construction)
- Secretary-level reports on fleet utilization

## External Dependencies

**Third-Party Services:**
- Firebase (Authentication, Firestore, Storage, Hosting)
- Google Maps API for interactive mapping
- Google Drive for video streaming
- OpenRouter API for chatbot AI capabilities

**Key NPM Packages:**
- `firebase` - Firebase SDK for web
- `@react-google-maps/api` - Google Maps React wrapper
- `chart.js` and `react-chartjs-2` - Chart rendering
- `@radix-ui/*` - Accessible UI component primitives
- `framer-motion` - Animation library
- `axios` - HTTP client for API requests
- `react-hook-form` with `@hookform/resolvers` and `zod` - Form management
- `@tanstack/react-query` - Data fetching and caching
- `tailwindcss` - Utility-first CSS framework

**Development Tools:**
- TypeScript for type safety
- Vite plugins for development experience
- ESLint and Prettier for code quality
- Drizzle Kit (configured but not actively used - system uses Firebase instead)

**Firebase Configuration:**
- Project ID: `transparencia-agricola`
- Authentication domain: `transparencia-agricola.firebaseapp.com`
- Service account credentials managed via environment variables
- Multi-tab IndexedDB persistence enabled

**Environment Variables Required:**
- Firebase service account credentials (PRIVATE_KEY, CLIENT_EMAIL, etc.)
- Google Maps API key
- OpenRouter API key for chatbot