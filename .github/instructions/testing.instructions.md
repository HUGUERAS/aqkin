---
applies_to:
  - "**/*.test.{ts,tsx,js,jsx}"
  - "**/*.spec.{ts,tsx,js,jsx,py}"
  - "apps/web-e2e/**/*.ts"
---

# Testing Instructions

## Testing Stack

### Frontend Testing
- **Vitest 4.0.0** - Unit and integration testing
- **React Testing Library 16.3.0** - Component testing
- **@vitest/ui** - Visual test runner
- **@vitest/coverage-v8** - Code coverage
- **JSDOM** - DOM environment for tests

### E2E Testing
- **Playwright 1.36.0** - End-to-end browser testing
- **@nx/playwright** - Nx integration

### Backend Testing
- **pytest** - Python testing framework
- **TestClient** - FastAPI test client

## Testing Philosophy

### General Principles
1. **Write tests that provide value** - Test behavior, not implementation
2. **Keep tests simple and readable** - Tests are documentation
3. **Test one thing at a time** - Single responsibility per test
4. **Make tests independent** - No test should depend on another
5. **Use descriptive test names** - Should explain what is being tested
6. **Follow AAA pattern** - Arrange, Act, Assert

## Frontend Unit Testing with Vitest

### Component Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  // ✅ Good: Descriptive test name explaining behavior
  it('displays user information when data is loaded', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  // ✅ Good: Testing user interaction
  it('calls onEdit when edit button is clicked', async () => {
    const handleEdit = vi.fn();
    const user = { name: 'John Doe', email: 'john@example.com' };
    
    render(<UserProfile user={user} onEdit={handleEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(handleEdit).toHaveBeenCalledOnce();
    expect(handleEdit).toHaveBeenCalledWith(user);
  });
  
  // ✅ Good: Testing async behavior
  it('shows loading state while fetching data', async () => {
    render(<UserProfile userId="123" />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
  
  // ✅ Good: Testing error states
  it('displays error message when fetch fails', async () => {
    const error = 'Failed to load user';
    
    render(<UserProfile userId="invalid" />);
    
    await waitFor(() => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });
});

// ❌ Bad: Testing implementation details
describe('UserProfile - Bad Examples', () => {
  it('sets loading state to true', () => {
    // Don't test internal state
    const { result } = renderHook(() => useState(false));
    // ...
  });
  
  it('calls useEffect', () => {
    // Don't test that hooks are called
    // Test the behavior/outcome instead
  });
});
```

### Hook Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('returns null user when not authenticated', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
  
  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await result.current.login('user@example.com', 'password');
    
    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

### Mocking

#### Mocking Modules
```typescript
import { vi } from 'vitest';

// ✅ Mock external dependencies
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [{ id: 1, name: 'Test' }],
        error: null
      }))
    }))
  }))
}));
```

#### Mocking Functions
```typescript
import { vi } from 'vitest';

// ✅ Mock callback functions
const mockCallback = vi.fn();

// ✅ Mock with return values
const mockFetch = vi.fn().mockResolvedValue({
  json: async () => ({ data: 'test' })
});

// ✅ Mock implementations
const mockValidate = vi.fn((value) => value.length > 0);
```

### Testing Async Operations
```typescript
describe('API calls', () => {
  // ✅ Good: Using async/await
  it('fetches projects successfully', async () => {
    const projects = await fetchProjects();
    
    expect(projects).toHaveLength(2);
    expect(projects[0].name).toBe('Project 1');
  });
  
  // ✅ Good: Using waitFor for state updates
  it('updates UI after data fetch', async () => {
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
  });
});
```

## E2E Testing with Playwright

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page before each test
    await page.goto('http://localhost:4200/projects');
  });
  
  test('should create a new project', async ({ page }) => {
    // Click create button
    await page.click('button:has-text("New Project")');
    
    // Fill form
    await page.fill('input[name="name"]', 'Test Project');
    await page.fill('textarea[name="description"]', 'Test Description');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify navigation and success
    await expect(page).toHaveURL(/\/projects\/\d+/);
    await expect(page.locator('h1')).toContainText('Test Project');
  });
  
  test('should display validation errors', async ({ page }) => {
    await page.click('button:has-text("New Project")');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Check for error messages
    await expect(page.locator('.error')).toContainText('Name is required');
  });
  
  test('should filter projects by search term', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder="Search"]', 'Alpha');
    
    // Wait for results
    await page.waitForSelector('.project-item');
    
    // Verify filtered results
    const projects = await page.locator('.project-item').count();
    expect(projects).toBeGreaterThan(0);
    
    const firstProject = page.locator('.project-item').first();
    await expect(firstProject).toContainText('Alpha');
  });
});
```

### Page Object Pattern
```typescript
// ✅ Good: Reusable page objects
class ProjectPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('http://localhost:4200/projects');
  }
  
  async createProject(name: string, description: string) {
    await this.page.click('button:has-text("New Project")');
    await this.page.fill('input[name="name"]', name);
    await this.page.fill('textarea[name="description"]', description);
    await this.page.click('button[type="submit"]');
  }
  
  async getProjectByName(name: string) {
    return this.page.locator(`.project-item:has-text("${name}")`);
  }
}

// Use in tests
test('create and verify project', async ({ page }) => {
  const projectPage = new ProjectPage(page);
  
  await projectPage.goto();
  await projectPage.createProject('Test', 'Description');
  
  const project = await projectPage.getProjectByName('Test');
  await expect(project).toBeVisible();
});
```

## Backend Testing (Python)

### FastAPI Testing
```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    """Create a test client with test database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client

# ✅ Good: Test API endpoints
def test_create_project(client):
    """Test creating a project."""
    response = client.post(
        "/api/projetos",
        json={"nome": "Test Project", "descricao": "Test"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["nome"] == "Test Project"
    assert "id" in data

def test_get_project_not_found(client):
    """Test getting non-existent project."""
    response = client.get("/api/projetos/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_list_projects_pagination(client, db_session):
    """Test project listing with pagination."""
    # Create test data
    for i in range(5):
        client.post("/api/projetos", json={"nome": f"Project {i}"})
    
    # Test pagination
    response = client.get("/api/projetos?skip=0&limit=3")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
```

### Testing with Fixtures
```python
import pytest
from app.models import Project, Lote

@pytest.fixture
def sample_project(db_session):
    """Create a sample project for testing."""
    project = Project(nome="Sample Project", descricao="Sample")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project

@pytest.fixture
def sample_lote(db_session, sample_project):
    """Create a sample lote for testing."""
    lote = Lote(
        nome="Sample Lote",
        projeto_id=sample_project.id,
        geometria="SRID=4326;POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))"
    )
    db_session.add(lote)
    db_session.commit()
    db_session.refresh(lote)
    return lote

# Use fixtures in tests
def test_get_lote(client, sample_lote):
    """Test getting a lote."""
    response = client.get(f"/api/lotes/{sample_lote.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["nome"] == "Sample Lote"
```

## Test Coverage

### Running Coverage
```bash
# Frontend coverage
npx nx test web --coverage

# View coverage report
open apps/web/coverage/index.html
```

### Coverage Guidelines
- Aim for at least 80% code coverage
- Focus on critical paths and business logic
- Don't obsess over 100% coverage
- Coverage is a metric, not a goal

## Test Organization

### File Structure
```
apps/web/src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx     # Colocated tests
│   └── Map/
│       ├── Map.tsx
│       └── Map.test.tsx
└── utils/
    ├── formatDate.ts
    └── formatDate.test.ts

apps/api/
├── routers/
│   └── projetos.py
└── tests/
    ├── test_projetos.py         # Separate test directory
    └── conftest.py              # Shared fixtures
```

## Best Practices

### Do's ✅
1. **Test behavior, not implementation**
2. **Use descriptive test names** - Should read like documentation
3. **Keep tests simple and focused** - One assertion per test when possible
4. **Use fixtures and factories** - Reduce code duplication
5. **Mock external dependencies** - Tests should be isolated
6. **Test edge cases** - Null, empty, invalid inputs
7. **Test error handling** - Verify error states
8. **Clean up after tests** - Reset state, close connections
9. **Run tests before committing** - Catch issues early
10. **Keep tests fast** - Slow tests won't be run

### Don'ts ❌
1. **Don't test framework code** - Trust React, FastAPI work correctly
2. **Don't test implementation details** - Test what users see
3. **Don't use real external services** - Mock APIs, databases
4. **Don't write brittle tests** - Avoid testing exact text/styling
5. **Don't skip error cases** - Test failure paths too
6. **Don't make tests dependent** - Each test should be independent
7. **Don't ignore flaky tests** - Fix or remove them
8. **Don't commit failing tests** - Fix or skip them
9. **Don't test everything** - Focus on value
10. **Don't sacrifice code quality for coverage** - Coverage is a means, not an end

## Common Testing Patterns

### Testing Forms
```typescript
it('submits form with valid data', async () => {
  const handleSubmit = vi.fn();
  
  render(<ProjectForm onSubmit={handleSubmit} />);
  
  // Fill form
  await userEvent.type(screen.getByLabelText('Name'), 'Test Project');
  await userEvent.type(screen.getByLabelText('Description'), 'Test Description');
  
  // Submit
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  // Verify
  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Test Project',
      description: 'Test Description'
    });
  });
});
```

### Testing API Calls
```typescript
it('handles API errors gracefully', async () => {
  // Mock failed API call
  vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
  
  render(<ProjectList />);
  
  await waitFor(() => {
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
```

### Testing Maps
```typescript
it('displays map with markers', async () => {
  const locations = [
    { lat: 37.7749, lng: -122.4194, name: 'San Francisco' }
  ];
  
  render(<Map locations={locations} />);
  
  await waitFor(() => {
    const map = screen.getByTestId('map-container');
    expect(map).toBeInTheDocument();
  });
  
  // Verify markers are rendered (implementation depends on map library)
});
```

## Debugging Tests

### Vitest Debug
```typescript
import { screen } from '@testing-library/react';

it('debug example', () => {
  render(<Component />);
  
  // Print DOM tree
  screen.debug();
  
  // Print specific element
  screen.debug(screen.getByRole('button'));
});
```

### Playwright Debug
```bash
# Run with UI
npx playwright test --ui

# Run with debug mode
npx playwright test --debug

# Run headed (see browser)
npx playwright test --headed
```

## CI/CD Testing

### Running Tests in CI
```bash
# Frontend CI tests
npx nx test-ci web

# E2E tests in CI (with proper setup)
npx nx e2e web-e2e --configuration=ci
```

### Test Scripts
Ensure package.json has appropriate test scripts:
```json
{
  "scripts": {
    "test": "nx test",
    "test:ci": "nx test-ci",
    "test:coverage": "nx test --coverage",
    "test:e2e": "nx e2e"
  }
}
```
