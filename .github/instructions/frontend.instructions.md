---
applies_to:
  - "apps/web/**/*.{ts,tsx,js,jsx,css}"
  - "apps/web-e2e/**/*.ts"
---

# Frontend Instructions for React + TypeScript Web App

## Technology Stack

- **React 19.0.0** with hooks and functional components
- **TypeScript 5.9.2** with strict mode
- **Vite 7.0.0** for fast development and building
- **React Router 6.30.3** for client-side routing
- **OpenLayers 10.7.0** for interactive maps
- **Supabase JS Client 2.93.3** for backend integration
- **CSS Modules** for component styling

## React Best Practices

### Component Structure
- Use functional components with hooks (no class components)
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks
- Use `React.memo()` for expensive components that render frequently
- Prefer composition over inheritance

### Hooks Usage
```typescript
// ✅ Good: Proper hooks usage
const MyComponent = () => {
  const [state, setState] = useState<string>('');
  const value = useMemo(() => expensiveComputation(state), [state]);
  
  useEffect(() => {
    // Side effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  return <div>{value}</div>;
};

// ❌ Bad: Missing dependencies, no types
const MyComponent = () => {
  const [state, setState] = useState('');
  useEffect(() => {
    doSomething(state);
  }, []); // Missing dependency
  
  return <div>{state}</div>;
};
```

### TypeScript for React

#### Component Props
```typescript
// ✅ Good: Explicit prop types
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUpdate,
  className
}) => {
  // Component implementation
};

// ❌ Bad: Using `any` or no types
const UserProfile = ({ userId, onUpdate, className }: any) => {
  // ...
};
```

#### State Types
```typescript
// ✅ Good: Proper state typing
interface FormData {
  name: string;
  email: string;
}

const [formData, setFormData] = useState<FormData>({
  name: '',
  email: ''
});

// ❌ Bad: Inferring complex types
const [formData, setFormData] = useState({
  name: '',
  email: ''
});
```

## File Organization

### Component Files
```
apps/web/src/
├── components/          # Reusable components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   └── Button.test.tsx
│   └── Map/
│       ├── Map.tsx
│       ├── Map.module.css
│       └── Map.test.tsx
├── pages/              # Page components
│   ├── Cliente/        # Client role pages
│   └── Topografo/      # Surveyor role pages
├── hooks/              # Custom hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **CSS Modules**: ComponentName.module.css (e.g., `Button.module.css`)
- **Types**: PascalCase (e.g., `User`, `ProjectData`)

## Routing with React Router

```typescript
// ✅ Good: Typed routes with proper structure
import { useParams, useNavigate } from 'react-router-dom';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use id safely with type checking
  if (!id) {
    return <div>Invalid project</div>;
  }
  
  return <div>Project {id}</div>;
};
```

## State Management

### Local State
- Use `useState` for simple component state
- Use `useReducer` for complex state logic
- Lift state up when multiple components need it

### Context API
```typescript
// ✅ Good: Properly typed context
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## OpenLayers Map Integration

### Map Component Best Practices
```typescript
// ✅ Good: Proper OpenLayers initialization and cleanup
import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Initialize map
    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });
    
    // Cleanup
    return () => {
      mapInstance.current?.setTarget(undefined);
    };
  }, []);
  
  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};
```

### Coordinate Systems
- Store coordinates as EPSG:4326 (WGS 84): `[longitude, latitude]`
- Transform to EPSG:3857 (Web Mercator) for display
- Use OpenLayers' `fromLonLat()` and `toLonLat()` helpers

```typescript
import { fromLonLat, toLonLat } from 'ol/proj';

// Convert for display
const webMercatorCoords = fromLonLat([-122.4194, 37.7749]);

// Convert back to storage format
const wgs84Coords = toLonLat(webMercatorCoords);
```

## Supabase Integration

```typescript
// ✅ Good: Proper Supabase client usage with types
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Typed query
interface Project {
  id: string;
  name: string;
  created_at: string;
}

const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .returns<Project[]>();
    
  if (error) throw error;
  return data || [];
};
```

## Styling with CSS Modules

```typescript
// Component.tsx
import styles from './Component.module.css';

const Component = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hello</h1>
    </div>
  );
};
```

```css
/* Component.module.css */
.container {
  padding: 1rem;
  background-color: var(--bg-color);
}

.title {
  font-size: 1.5rem;
  color: var(--text-color);
}
```

## Error Handling

```typescript
// ✅ Good: Proper error handling with user feedback
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const data = await apiCall();
    // Handle success
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred';
    setError(message);
    console.error('Error fetching data:', err);
  } finally {
    setLoading(false);
  }
};

// Display error to user
{error && <div className={styles.error}>{error}</div>}
{loading && <div className={styles.loading}>Loading...</div>}
```

## Performance Optimization

### Memoization
```typescript
// ✅ Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// ✅ Use useCallback for functions passed to children
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### Code Splitting
```typescript
// ✅ Lazy load routes and heavy components
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyComponent />
  </Suspense>
);
```

## Testing

### Component Tests with Vitest
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Accessibility

```typescript
// ✅ Good: Semantic HTML and ARIA labels
<button
  onClick={handleClick}
  aria-label="Close dialog"
  disabled={isDisabled}
>
  <span aria-hidden="true">×</span>
</button>

// ✅ Form accessibility
<form onSubmit={handleSubmit}>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <span id="email-error" role="alert">
      {errors.email}
    </span>
  )}
</form>
```

## Environment Variables

- Prefix all Vite environment variables with `VITE_`
- Access via `import.meta.env.VITE_*`
- Never commit actual values (use `.env.example`)

```typescript
// ✅ Good: Type-safe environment variables
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('VITE_API_URL is not defined');
}
```

## Common Anti-Patterns to Avoid

1. ❌ **Don't mutate state directly**
   ```typescript
   // Bad
   state.push(item);
   setState(state);
   
   // Good
   setState([...state, item]);
   ```

2. ❌ **Don't use indexes as keys for dynamic lists**
   ```typescript
   // Bad
   items.map((item, index) => <div key={index}>{item}</div>)
   
   // Good
   items.map((item) => <div key={item.id}>{item}</div>)
   ```

3. ❌ **Don't forget cleanup in useEffect**
   ```typescript
   // Bad
   useEffect(() => {
     const interval = setInterval(() => {}, 1000);
   }, []);
   
   // Good
   useEffect(() => {
     const interval = setInterval(() => {}, 1000);
     return () => clearInterval(interval);
   }, []);
   ```

4. ❌ **Don't use `any` type**
   - Always provide proper TypeScript types
   - Use `unknown` if type is truly uncertain
