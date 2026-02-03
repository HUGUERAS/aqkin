# GitHub Copilot Instructions for AtivoReal Monorepo

## Project Overview

This is an Nx monorepo for AtivoReal, a geospatial property management system built with:
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Python FastAPI with PostGIS
- **Database**: Supabase PostgreSQL with PostGIS extensions
- **Monorepo Tool**: Nx 22.4.4

## Quick Reference

- **Main Documentation**: See specialized instructions in `.github/instructions/`:
  - `testing.instructions.md` - Comprehensive testing guide
  - `frontend.instructions.md` - React/TypeScript best practices  
  - `backend.instructions.md` - FastAPI/Python patterns
- **Setup Guide**: See `README.md` and `SUPABASE_SETUP.md`
- **Deployment**: See `DEPLOY_GUIDE.md` and `DEPLOY_BACKEND.md`

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

## Bootstrap & Setup

Before making any changes:
1. **Install dependencies**: `npm install` (installs all monorepo dependencies)
2. **Set up environment variables**: Copy `.env.example` files in `apps/web/` and `apps/api/` to `.env` and configure
3. **Python setup** (for backend): `cd apps/api && pip install -r requirements.txt`
4. **Database setup**: Follow `SUPABASE_SETUP.md` for database configuration

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
npx nx lint api           # Lint backend code (uses black + flake8)
npx nx typecheck web      # TypeScript type checking

# Python Code Formatting & Linting
cd apps/api && black .    # Format Python code
cd apps/api && flake8 . --max-line-length=120 --extend-ignore=E203,W503

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
- **Required**: Use conventional commits format: `type(scope): message`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Examples**:
  - `feat(web): add project filtering by status`
  - `fix(api): correct PostGIS coordinate transformation`
  - `docs(readme): update installation instructions`
- Keep messages clear and descriptive (max 72 characters for subject line)

### Branching Strategy
- Create feature branches from `main`: `feature/description` or `fix/description`
- Use `copilot/task-description` for Copilot agent work
- Never commit directly to `main` - always use pull requests

### Pull Requests
- Write clear PR descriptions explaining:
  - What changes were made
  - Why the changes were necessary
  - How to test the changes
- Reference related issues using `Fixes #123` or `Closes #123`
- Ensure all CI checks pass (lint, test, build)
- Update documentation as needed
- Request review before merging

### CI Pipeline
The CI runs automatically on pull requests and checks:
- **Frontend**: ESLint, TypeScript compilation, Vitest tests, builds
- **Backend**: Black formatting check, Flake8 linting, Python tests
- All checks must pass before merging

## Common Pitfalls to Avoid

1. **Don't use `any` type** - Always specify proper types
2. **Don't commit secrets** - Use environment variables
3. **Don't ignore TypeScript errors** - Fix them properly
4. **Don't skip tests** - Write tests for new features
5. **Don't hardcode coordinates** - Use proper SRID and transformation
6. **Don't mix sync/async code improperly** - Use async/await consistently
7. **Don't ignore ESLint warnings** - Fix or properly disable with justification

## Troubleshooting

### Common Setup Issues

**Problem: `npm install` fails**
- Solution: Ensure Node.js version 20 or higher is installed (`node --version`)
- Try: `rm -rf node_modules package-lock.json && npm install`

**Problem: Python dependencies fail to install**
- Solution: Ensure Python 3.11+ is installed (`python --version`)
- Try: `cd apps/api && pip install --upgrade pip && pip install -r requirements.txt`

**Problem: TypeScript errors in IDE but build passes**
- Solution: Restart TypeScript server in your IDE
- VS Code: Cmd/Ctrl + P → "TypeScript: Restart TS Server"

**Problem: Tests fail locally but pass in CI**
- Solution: Ensure environment variables are set correctly
- Check: Compare `.env.example` with your `.env` files

**Problem: PostGIS/geospatial queries failing**
- Solution: Verify Supabase PostGIS extension is enabled
- Check: Coordinates are in EPSG:4326 format (WGS 84)
- See: `SUPABASE_SETUP.md` for database configuration

**Problem: Port 4200 already in use**
- Solution: `lsof -ti:4200 | xargs kill -9` or use different port
- Alternative: `PORT=4201 npx nx serve web`

### Getting Help
- Check project documentation: `README.md`, `SUPABASE_SETUP.md`, `DEPLOY_GUIDE.md`
- Review existing tests for examples
- Check GitHub issues for similar problems
- Review CI logs for detailed error messages

## Working with This Codebase

### Before Making Changes
1. **Understand the scope**: Read the issue/task description carefully
2. **Explore related code**: Use grep/glob to find similar implementations
3. **Check existing patterns**: Look at similar components/functions for consistency
4. **Run tests**: Verify current state before making changes
5. **Plan minimal changes**: Think about the smallest change that solves the problem

### Making Changes
1. **Follow existing patterns**: Match the code style and architecture of similar files
2. **Add tests**: Write tests for new functionality (see `testing.instructions.md`)
3. **Test incrementally**: Run tests after each significant change
4. **Document as you go**: Add comments for complex logic, update README if needed
5. **Review before committing**: Check your changes solve the issue without breaking existing functionality

### Example: Good vs. Bad Approach

**❌ Bad: Adding a new API endpoint without following patterns**
```python
# Missing type hints, no error handling, doesn't match existing structure
@app.get("/projects")
def get_projects(db):
    return db.query(Project).all()
```

**✅ Good: Following established patterns**
```python
# Proper typing, error handling, follows existing router pattern
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[ProjectResponse]:
    """Retrieve all projects with pagination."""
    try:
        projects = db.query(Project).offset(skip).limit(limit).all()
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**❌ Bad: Adding a React component without types**
```typescript
// No prop types, using any, no error handling
export const ProjectCard = ({ project, onClick }) => {
  return (
    <div onClick={() => onClick(project)}>
      {project.name}
    </div>
  );
};
```

**✅ Good: Properly typed React component**
```typescript
// Proper TypeScript, error handling, semantic HTML
interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onClick,
  className 
}) => {
  const handleClick = () => {
    if (project && project.id) {
      onClick(project);
    }
  };

  return (
    <article 
      className={className}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      <h3>{project.name}</h3>
      {project.description && <p>{project.description}</p>}
    </article>
  );
};
```

### Code Review Checklist
Before submitting changes, verify:
- [ ] All TypeScript/Python types are properly defined
- [ ] Error handling is implemented
- [ ] Tests are added/updated and passing
- [ ] Code follows existing patterns and style
- [ ] No secrets or credentials in code
- [ ] Documentation is updated if needed
- [ ] Linting passes (`npx nx lint`)
- [ ] Build succeeds (`npx nx build`)
- [ ] Commit messages follow conventional format

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

## Constraints & Boundaries

### DO NOT Do the Following:

1. **Never commit secrets or credentials**
   - No API keys, passwords, tokens, or connection strings in code
   - Always use environment variables and `.env` files
   - `.env` files are gitignored - never commit them
   - Document required variables in `.env.example` files

2. **Never modify these protected directories/files without explicit instruction**:
   - `.git/` - Git internal files
   - `.github/workflows/` - CI/CD configuration (requires careful review)
   - `node_modules/`, `dist/`, `build/` - Generated/dependency directories
   - `.env`, `.env.local` - Environment files with secrets
   - Database migration files in `database/migrations/` (requires careful review)

3. **Never bypass security measures**:
   - Don't disable TypeScript strict mode
   - Don't use `any` types without justification
   - Don't disable ESLint rules globally (use inline exceptions with comments if needed)
   - Don't create SQL injection vulnerabilities (always use ORM)
   - Don't expose sensitive data in logs or error messages

4. **Never make breaking changes without discussion**:
   - Don't change public API contracts without versioning
   - Don't modify database schemas without migration scripts
   - Don't remove or rename existing environment variables
   - Don't update major versions of dependencies without testing

5. **Code Quality Standards - Never**:
   - Submit code with TypeScript errors
   - Submit code that fails linting
   - Submit code without tests for new features
   - Submit code with failing tests
   - Ignore Prettier formatting rules

6. **Never modify generated or third-party code**:
   - OpenLayers library internals
   - Supabase client generated code
   - Nx generated configuration (without understanding implications)

### File Access Guidelines:

- **Full access**: `apps/web/src/`, `apps/api/` (application code)
- **Read-only unless instructed**: Configuration files, workflow files, package.json
- **Never touch**: `.git/`, `.env` files, `node_modules/`, build artifacts

### When in Doubt:
- Ask for clarification before making risky changes
- Document assumptions in PR descriptions
- Add comments explaining non-obvious decisions
- Follow the principle of least change - make minimal modifications
