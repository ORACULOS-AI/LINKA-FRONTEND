# GEMINI.md

Este arquivo é para documentação e notas relacionadas ao desenvolvimento com Gemini.

## Frontend Architecture

### Overview
The project is a Next.js application built with the App Router architecture. It serves as the frontend for the LINK@ platform, focusing on connecting users, projects, and resources within the UFC ecosystem.

### Core Technologies
- **Framework:** Next.js 15.2.2 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI (Radix UI)
- **State Management:** React Query (`@tanstack/react-query`)
- **Form Handling:** React Hook Form + Zod validation
- **Icons:** Lucide React, FontAwesome, Heroicons
- **HTTP Client:** Axios with custom interceptors for JWT handling

### Project Structure

#### `app/` (Routes & Layouts)
- **Root Layout:** `layout.tsx` handles global fonts (Poppins), analytics, and wraps content in `PlatformLayoutClient`.
- **Platform Layout:** `platform-layout-client.tsx` manages global providers (`Providers`, `NotificationsProvider`), sidebar visibility, and route protection via `PrivateRoute`.
- **Feature Modules:**
  - `administrativo/`: Admin dashboard
  - `conversas/`: Chat/Messages
  - `eventos/`: Event management
  - `iniciativas/`, `laboratorios/`, `negocios/`: Listings and details
  - `meus-*/`: User-specific management dashboards
  - `login/`: Authentication
  - `perfil/`: User profile
- **API:** `api/` directory exists, likely for Next.js API routes or proxying.

#### `components/`
- **`ui/`:** Reusable UI components based on Shadcn/UI (Button, Card, Dialog, Form, etc.).
- **Feature-Specific:** `initiatives/`, `meetings/`, `registration/`.
- **Shared:** `sidebar.tsx`, `vitrine-card.tsx`, `startup-card.tsx`, `RouteGuard.tsx`, `private_route.tsx`.

#### `lib/` & `hooks/`
- **`api.ts`:** Configured Axios instance with request/response interceptors for JWT refresh logic.
- **`utils.ts`:** Utility functions (likely `cn` for Tailwind class merging).
- **`react-query.ts`:** React Query client setup.
- **Custom Hooks:** `useRequests.ts`, `use-toast.ts`, `useCampusOptions.ts`.

### Key Features
- **Authentication:** JWT-based with auto-refresh mechanism in `api.ts`. Protected routes via `PrivateRoute`.
- **Real-time:** LiveKit integration (`@livekit/*`) for video/audio.
- **UI/UX:** Responsive design with sidebar navigation. mobile drawer support. comprehensive form validations.
- **Data Visualization:** Recharts and React Flow.
