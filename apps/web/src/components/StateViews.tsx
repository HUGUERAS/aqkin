interface StateViewProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function LoadingState({ title, description }: StateViewProps) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
      <p style={{ fontSize: '1.25rem', margin: 0 }}>{title}</p>
      {description && <p style={{ marginTop: '0.5rem' }}>{description}</p>}
    </div>
  );
}

export function EmptyState({ title, description, actionLabel, onAction }: StateViewProps) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '12px' }}>
      <p style={{ fontSize: '1.25rem', margin: 0 }}>{title}</p>
      {description && <p style={{ marginTop: '0.5rem' }}>{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ title, description, actionLabel, onAction }: StateViewProps) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#7f1d1d', background: '#fef2f2', borderRadius: '12px' }}>
      <p style={{ fontSize: '1.1rem', margin: 0 }}>{title}</p>
      {description && <p style={{ marginTop: '0.5rem', color: '#991b1b' }}>{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#991b1b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
