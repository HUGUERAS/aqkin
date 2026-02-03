# GitHub Copilot Instructions for AtivoReal Monorepo

## Project Overview

This is an Nx monorepo for AtivoReal, a geospatial property management system built with:
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Python FastAPI with PostGIS
- **Database**: Supabase PostgreSQL with PostGIS extensions
- **Monorepo Tool**: Nx 22.4.4

## Tech Stack

### Frontend (apps/web)
- React 19.0.0 with TypeScript 5.9.2
- Vite 7.0.0 for bundling
- React Router 6.30.3 for routing
- OpenLayers 10.7.0 for mapping
- Supabase JS Client 2.93.3
- Vitest 4.0.0 for testing
- CSS Modules for styling

### Backend (apps/api)
- FastAPI 0.109.0 (Python web framework)
- SQLAlchemy 2.0.25 + GeoAlchemy2 0.14.3
- Shapely 2.0.2 for geometric operations
- Supabase Python client 2.3.4
- JWT authentication (python-jose)
- Uvicorn ASGI server

### Build & Development
- Nx workspace for monorepo management
- ESLint + Prettier for code quality
- SWC for fast TypeScript compilation
- Playwright for E2E testing

## Key Commands

```bash
# Development
npx nx serve web          # Start web dev server (port 4200)
npx nx build web          # Build web app
npx nx build api          # Build Python API

# Testing
npx nx test web           # Run frontend unit tests (Vitest)
npx nx test-ci web        # Run tests in CI mode
npx nx e2e web-e2e        # Run E2E tests (Playwright)

# Code Quality
npx nx lint web           # Lint frontend code
npx nx lint api           # Lint backend code
npx nx typecheck web      # TypeScript type checking

# Utilities
npx nx graph              # Visualize dependency graph
npx nx show project web   # Show available targets for project
```

## Coding Standards

### General
- **TypeScript**: Always use TypeScript with strict mode enabled
- **No `any` types**: Use proper types or `unknown` instead of `any`
- **Imports**: Use absolute imports with path aliases defined in `tsconfig.base.json`
- **Error Handling**: Always handle errors gracefully with proper error messages
- **Security**: Never commit secrets; use environment variables
- **Code Style**: Follow ESLint and Prettier configurations

### Naming Conventions
- **Files**: Use kebab-case for file names (e.g., `user-profile.tsx`, `api-client.ts`)
- **Components**: Use PascalCase for React components
- **Functions**: Use camelCase for functions and variables
- **Constants**: Use UPPER_SNAKE_CASE for constants
- **Types/Interfaces**: Use PascalCase with descriptive names

### Documentation
- Add JSDoc comments for public APIs and complex functions
- Keep README files up to date
- Document environment variables in `.env.example` files

## Architecture Patterns

### Frontend
- Role-based page organization (`pages/Cliente/`, `pages/Topografo/`)
- Component-based architecture with reusable components
- State management using React hooks
- Authentication via Supabase
- Geospatial visualization with OpenLayers

### Backend
- RESTful API design with FastAPI
- PostgreSQL with PostGIS for geospatial data
- SQLAlchemy ORM with GeoAlchemy2 for spatial types
- JWT-based authentication
- Pydantic models for validation
- Async/await patterns where applicable

### Testing
- Unit tests with Vitest for frontend
- Integration tests for API endpoints
- E2E tests with Playwright
- Test files should be colocated with source files when possible

## Environment & Configuration

### Environment Files
- `apps/web/.env` - Frontend environment variables
- `apps/api/.env` - Backend environment variables
- `.env.example` files document required variables
- Never commit actual `.env` files

### Required Environment Variables
- Supabase URL and anon key for client
- Database connection strings
- JWT secret keys
- API base URLs

## Database & Migrations

- Supabase PostgreSQL with PostGIS extensions enabled
- PostGIS used for geometric data (points, polygons, etc.)
- Use `supabase_migrate.py` for database migrations
- Spatial Reference System: EPSG:4326 (WGS 84) for coordinates

## Dependencies

### Adding New Dependencies
- Use `npm install` for frontend packages
- Use `pip` or `poetry` for Python packages
- Always check for security vulnerabilities
- Prefer well-maintained, popular packages
- Update `package.json` or `requirements.txt` accordingly

### Version Management
- Keep dependencies up to date with security patches
- Test thoroughly before upgrading major versions
- Document breaking changes in commit messages

## Git & CI/CD

### Commit Messages
- Use conventional commits format: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Keep messages clear and descriptive

### Pull Requests
- Write clear PR descriptions
- Reference related issues
- Ensure all tests pass
- Update documentation as needed

## Common Pitfalls to Avoid

1. **Don't use `any` type** - Always specify proper types
2. **Don't commit secrets** - Use environment variables
3. **Don't ignore TypeScript errors** - Fix them properly
4. **Don't skip tests** - Write tests for new features
5. **Don't hardcode coordinates** - Use proper SRID and transformation
6. **Don't mix sync/async code improperly** - Use async/await consistently
7. **Don't ignore ESLint warnings** - Fix or properly disable with justification

## Geospatial Considerations

- Always use EPSG:4326 (WGS 84) for coordinate storage
- Transform to Web Mercator (EPSG:3857) for display in OpenLayers
- Use PostGIS spatial functions for queries
- Validate geometric data before storage
- Handle coordinate precision appropriately (typically 6-8 decimal places)

## Accessibility & UX

- Ensure semantic HTML structure
- Add proper ARIA labels where needed
- Support keyboard navigation
- Provide meaningful error messages to users
- Ensure maps are accessible (provide text alternatives)

## Performance

- Lazy load components when appropriate
- Optimize images and assets
- Use React.memo for expensive components
- Index database queries appropriately
- Cache API responses when suitable
- Paginate large data sets

## Security

- Validate all user inputs
- Sanitize data before database queries
- Use parameterized queries (SQLAlchemy handles this)
- Implement proper CORS policies
- Follow OWASP security guidelines
- Keep dependencies updated for security patches
