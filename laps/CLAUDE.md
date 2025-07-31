# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` - Starts Vite dev server with HMR
- **Build for production**: `npm run build` - Runs TypeScript compilation and Vite build
- **Lint code**: `npm run lint` - Runs ESLint on TypeScript/TSX files
- **Preview production build**: `npm run preview` - Serves the built application locally

## Application Architecture

This is a React + TypeScript vehicle service lookup system for "Luciano Auto Peças" (auto parts shop) with the following key architecture:

### Authentication & Routing
- Uses Supabase for authentication with email/password and Google OAuth
- React Router DOM for client-side routing with protected routes
- Authentication state managed in `App.tsx` with session persistence
- Two main routes: `/login` (Login component) and `/` (ConsultaServicos component)

### Core Functionality
- **Vehicle History Lookup**: Search vehicle service history by license plate
- **External API Integration**: Fetches data from `https://pp.campinagrande.br/historico?placa={placa}`
- **Service History Display**: Shows detailed service records with filtering capabilities
- **Owner Information**: Toggle-able display of vehicle owner details

### Key Components
- `App.tsx`: Main app with auth state and routing logic
- `Login.tsx`: Authentication form with email/password and Google login
- `ConsultaServicos.tsx`: Main service lookup interface with search, filtering, and data display

### Data Structure
The application handles vehicle data through well-defined TypeScript interfaces in `src/types/veiculo.ts`:
- `HistoricoVeiculo`: Main response containing plate, owner info, and service history
- `Historico`: Individual service record with date, mileage, and service items
- `ItemServico`: Individual service item details
- `UltimoDono`: Vehicle owner information

### Styling & UI
- Uses Tailwind CSS with custom blue color palette
- Responsive design with mobile-first approach
- Custom blue theme configuration in `tailwind.config.js`
- Logo integration with company branding

### Services Layer
- `services/supabase.ts`: Supabase client configuration using environment variables
- `services/api.ts`: External API integration for vehicle history lookup
- Environment variables required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### State Management
- React useState for local component state
- Supabase auth state management for user sessions
- No external state management library used

## Important Notes

- The application requires Supabase environment variables to be configured
- External API dependency on `https://pp.campinagrande.br` for vehicle data
- Authentication is required to access the main application functionality
- TypeScript strict mode enabled with comprehensive type definitions