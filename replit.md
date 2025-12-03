# Daily Kharcha - Expense Tracker

## Overview

Daily Kharcha is a personal finance management application that helps users track their daily expenses and income. The application provides comprehensive expense tracking, budget management, note-taking capabilities, and financial reporting features. Built as a full-stack web application, it uses React for the frontend and Express.js for the backend, with SQLite as the local database.

## Recent Changes

**December 2025 - Voice Input Feature:**
- Added voice input for adding expenses/income hands-free
- Uses Web Speech API (browser native, no external API needed)
- Supports commands like "Add 200 rupees Food" or "Salary 5000"
- Parses amount, category, and transaction type from voice
- Includes category aliases for common Hindi/English terms
- Shows confirmation before saving with visual feedback
- Graceful fallback for unsupported browsers

**December 2025 - Professional UI Redesign:**
- Complete visual overhaul with modern dark theme
- Organized sidebar navigation with sections: Main Menu, Financial Tools, Utilities
- Professional card-based dashboard layout with improved stat cards
- Enhanced typography, spacing, and visual hierarchy
- Updated color scheme with purple accent (`--primary: #7c3aed`)
- Improved modal designs with animations
- Better responsive layout for mobile devices

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with Vite as the build tool and development server
- React Router DOM for client-side routing
- Recharts for data visualization and charts
- Lucide React for icons
- date-fns for date manipulation

**Design Approach:**
- Component-based architecture using functional components
- Custom CSS with CSS variables for theming (dark theme)
- Modular styling with a design system defined in index.css
- Proxy configuration to route `/api` requests to the backend server

**Rationale:**
Vite provides fast development experience with hot module replacement. React's component model enables reusable UI elements. The dark theme with purple accent colors (`--primary: #7c3aed`) creates a modern, eye-friendly interface.

### Backend Architecture

**Technology Stack:**
- Express.js web server
- better-sqlite3 for synchronous SQLite database operations
- PDFKit for generating PDF reports
- CORS enabled for cross-origin requests

**API Design:**
RESTful API structure with `/api` prefix, handling:
- Transaction management (CRUD operations)
- Budget tracking and limits
- Note-taking functionality
- Report generation

**Rationale:**
Express provides a minimal, flexible framework. SQLite was chosen for its simplicity, zero-configuration setup, and file-based storage - ideal for a personal finance tracker that doesn't require complex multi-user database features. Synchronous database operations with better-sqlite3 simplify the code flow.

### Data Storage

**Database: SQLite (better-sqlite3)**

**Schema Design:**

1. **transactions table:**
   - Stores income and expense records
   - Fields: id, type, amount, category, description, date, createdAt
   - Type distinguishes between income and expenses

2. **notes table:**
   - Personal financial notes and reminders
   - Fields: id, title, content, createdAt

3. **budgets table:**
   - Budget limits per category
   - Fields: id, category (unique), amount, period, createdAt
   - Period field allows for different budget timeframes (monthly default)

**Rationale:**
File-based SQLite database (`expense_tracker.db`) provides persistence without requiring a separate database server. The schema is normalized with separate tables for different concerns while maintaining simplicity. Using `AUTOINCREMENT` for IDs and `DEFAULT CURRENT_TIMESTAMP` for audit trails follows best practices.

### Component Architecture

**Styling System:**
- CSS custom properties (variables) for consistent theming
- Color palette with primary (purple), success (green), danger (red), warning (orange), and info (blue)
- Multi-tier background colors for depth (bg-base, bg-primary, bg-secondary, etc.)
- Standardized border radii (sm, md, lg, xl) and shadows
- Transition utilities for smooth interactions

**Rationale:**
Using CSS variables enables easy theme maintenance and potential future theme switching. The dark color scheme reduces eye strain for frequent use.

### Development Setup

**Multi-Process Architecture:**
- Frontend dev server runs on port 5000
- Backend API server runs on port 3001
- Vite proxy forwards `/api` requests from frontend to backend
- HMR configured for Replit environment with `clientPort: 443`

**Rationale:**
Separate processes allow independent development of frontend and backend. The proxy configuration enables seamless API calls during development without CORS complications.

## External Dependencies

### Third-Party Services

**GitHub Integration:**
- Octokit REST API client for GitHub operations
- `push-to-github.js` script for repository deployment
- Uses Replit's connector system for OAuth authentication
- Manages access token refresh automatically

**Rationale:**
GitHub integration enables version control and code backup directly from the Replit environment, using Replit's identity system for secure authentication.

### NPM Packages

**Frontend:**
- `react` & `react-dom`: UI framework
- `react-router-dom`: Client-side routing
- `recharts`: Chart and data visualization library
- `lucide-react`: Icon library
- `date-fns`: Date manipulation utilities

**Backend:**
- `express`: Web application framework
- `better-sqlite3`: SQLite database driver
- `cors`: Cross-Origin Resource Sharing middleware
- `pdfkit`: PDF generation library

**Build Tools:**
- `vite`: Frontend build tool and dev server
- `@vitejs/plugin-react`: React support for Vite

**Rationale:**
Dependencies are kept minimal and focused. Recharts provides robust charting without heavy overhead. better-sqlite3 offers better performance than async alternatives for this use case. PDFKit enables generating financial reports as downloadable PDFs.

### Font Resources

**Google Fonts:**
- Inter font family (weights: 300-800)
- Loaded via preconnect for performance optimization

**Rationale:**
Inter is a highly readable sans-serif font optimized for UI design, particularly at small sizes common in financial data displays.