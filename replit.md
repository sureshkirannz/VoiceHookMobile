# Live Transcribe - Real-Time Audio Transcription App

## Overview

Live Transcribe is a mobile-first web application for real-time audio transcription with automatic webhook delivery. The app captures continuous speech using the browser's Web Speech API, transcribes it in real-time, and automatically forwards transcriptions to a configured webhook endpoint. Built with a focus on simplicity and immediate feedback, it provides a utility-first interface optimized for touch interactions and minimal cognitive load.

**Core Purpose**: Enable users to record audio continuously and receive instant transcriptions that are automatically delivered to external systems via webhook.

**Key Features**:
- Browser-based speech recognition (Chrome, Edge, Safari)
- Real-time transcription display
- Automatic webhook delivery to n8n workflow
- Delivery status tracking (pending/sent/failed)
- Mobile-optimized interface with Material Design principles
- Visual audio feedback during recording

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**:
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and dev server with hot module replacement
- **Wouter** for lightweight client-side routing (not react-router)
- **TanStack Query v5** for server state management and data fetching

**UI Component Strategy**:
- **shadcn/ui** components built on Radix UI primitives (New York style variant)
- **Tailwind CSS** for utility-first styling with custom design tokens
- Component path aliases configured: `@/components`, `@/lib`, `@/hooks`
- Mobile-first responsive design with breakpoints: base (mobile), md (tablet), lg (desktop)

**Design System**:
- Material Design principles with system-based approach
- Custom Tailwind configuration extending base theme with HSL color variables
- Spacing primitives: 3, 4, 6, 8, 12 units for consistent rhythm
- Border radius: lg (9px), md (6px), sm (3px)
- Typography: Inter font family via Google Fonts
- Theme support: Light and dark modes with CSS variable-based theming

**State Management Pattern**:
- Local component state with React hooks (useState, useEffect, useRef)
- Server state via TanStack Query with disabled refetching (`refetchOnWindowFocus: false`, `staleTime: Infinity`)
- Recognition state managed through refs to persist across renders without triggering updates

**Browser API Integration**:
- Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`) for audio capture
- Continuous recognition mode with interim results disabled
- Microphone permission handling through browser's native permission API
- Audio level visualization (simulated via animation patterns)

### Backend Architecture

**Server Framework**:
- **Express.js** on Node.js with TypeScript and ES Modules
- Custom Vite middleware integration for development HMR
- Production static file serving from `dist/public`

**API Design Pattern**:
- RESTful JSON API with single resource endpoint: `/api/transcriptions`
- POST endpoint for creating transcriptions with automatic webhook forwarding
- Request/response logging middleware for debugging
- Raw body buffering for potential webhook signature verification

**Storage Strategy**:
- **In-Memory Storage** (MemStorage class) as default implementation
- Interface-based design (`IStorage`) allows future database integration
- Transcription model includes: id, text, timestamp, webhookStatus
- Data sorted chronologically by timestamp

**Webhook Integration**:
- Non-blocking async webhook delivery to n8n instance
- Hardcoded webhook URL: `https://n8n.smartbytesolutions.co.nz/webhook/interview-audio`
- Automatic retry logic not implemented (fire-and-forget pattern)
- Status tracking: "pending" → "sent" or "failed"
- Error handling with console logging for debugging

**Database Preparation** (Currently Unused):
- **Drizzle ORM** configured with PostgreSQL dialect
- Schema defined in `shared/schema.ts` using pg-core types
- **Neon Database** serverless driver ready for integration
- Migration directory: `./migrations`
- Schema includes same fields as in-memory model

### External Dependencies

**Third-Party Services**:
- **n8n Workflow Automation**: Webhook receiver at `https://n8n.smartbytesolutions.co.nz/webhook/interview-audio`
  - Receives JSON payloads with `text` and `timestamp` fields
  - No authentication/signature verification currently implemented
  
**Database (Configured but Not Active)**:
- **Neon Serverless Postgres**: Connection configured via `DATABASE_URL` environment variable
- Session storage prepared with `connect-pg-simple`
- Drizzle ORM ready for schema migrations via `npm run db:push`

**Browser APIs**:
- **Web Speech API**: Primary dependency for speech recognition
  - Browser compatibility: Chrome, Edge, Safari
  - Requires HTTPS in production
  - User permission required for microphone access

**UI Component Libraries**:
- **Radix UI**: Unstyled, accessible component primitives (~25 components)
- **Lucide React**: Icon library for UI elements
- **date-fns**: Date formatting and manipulation
- **class-variance-authority** + **clsx**: Component variant styling utilities

**Development Tools**:
- **Replit Plugins**: Vite runtime error modal, cartographer, dev banner (dev mode only)
- **esbuild**: Server code bundling for production
- **tsx**: TypeScript execution for development server

**Notable Architectural Decisions**:

1. **In-Memory vs Database**: Currently using in-memory storage for simplicity and fast iteration. Database schema is prepared for future persistence needs when scaling or multi-instance deployment is required.

2. **Webhook Fire-and-Forget**: Chose not to implement retry logic to keep the initial version simple. Status tracking allows users to see failed deliveries, but manual retry would require future enhancement.

3. **Client-Side Speech Recognition**: Leveraging browser APIs eliminates need for audio streaming infrastructure and reduces server costs. Trade-off is browser compatibility limitations and requiring HTTPS.

4. **Hardcoded Webhook URL**: Currently configured for specific n8n instance. Future enhancement would move this to environment variables or user configuration.

5. **Mobile-First Design**: Touch-optimized interface with fixed bottom action bar and vertical layout prioritizes mobile use case while remaining functional on desktop.