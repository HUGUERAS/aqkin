import React from 'react';
import { PROJECT_STATUSES, ORCAMENTO_STATUSES, ProjectStatusKey, OrcamentoStatusKey } from '../constants';

interface StatusBadgeProps {
  status: ProjectStatusKey | OrcamentoStatusKey;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente reutilizável para exibir status com badge
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const statusConfig = PROJECT_STATUSES[status as ProjectStatusKey] || ORCAMENTO_STATUSES[status as OrcamentoStatusKey];

  if (!statusConfig) return null;

  const sizeStyles: Record<string, { padding: string; fontSize: string }> = {
    sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    md: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
    lg: { padding: '0.75rem 1rem', fontSize: '1rem' },
  };

  return (
    <span
      style={{
        ...sizeStyles[size],
        background: statusConfig.backgroundColor,
        color: statusConfig.textColor,
        borderRadius: '6px',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: `1px solid ${statusConfig.color}`,
        whiteSpace: 'nowrap',
      }}
    >
      {statusConfig.icon} {label || statusConfig.label}
    </span>
  );
};

interface StatusFilterProps {
  statuses: Record<string, { label: string; icon: string }>;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  counts: Record<string, number>;
  variant?: 'tabs' | 'buttons' | 'pills';
}

/**
 * Componente reutilizável para filtrar por status
 */
export const StatusFilter: React.FC<StatusFilterProps> = ({
  statuses,
  selectedStatus,
  onStatusChange,
  counts,
  variant = 'tabs',
}) => {
  const statusKeys = ['TODOS', ...Object.keys(statuses)];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: variant === 'pills' ? '0.75rem' : '0rem',
    borderBottom: variant === 'tabs' ? '1px solid #e0e0e0' : 'none',
    marginBottom: variant === 'tabs' ? '1.5rem' : '0rem',
    flexWrap: 'wrap',
  };

  const buttonStyle = (status: string, isActive: boolean): React.CSSProperties => {
    const isAll = status === 'TODOS';
    const config = isAll ? { label: 'Todos', icon: '📋' } : statuses[status];

    if (isActive && variant === 'tabs') {
      return {
        padding: '0.75rem 1.5rem',
        borderBottom: '3px solid #667eea',
        color: '#667eea',
        fontWeight: 600,
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        fontSize: '0.95rem',
      };
    }

    if (isActive && variant === 'pills') {
      return {
        padding: '0.5rem 1rem',
        background: '#667eea',
        color: 'white',
        border: '1px solid #667eea',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '0.9rem',
      };
    }

    if (isActive && variant === 'buttons') {
      return {
        padding: '0.5rem 1rem',
        background: '#667eea',
        color: 'white',
        border: '1px solid #667eea',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '0.9rem',
      };
    }

    if (variant === 'tabs') {
      return {
        padding: '0.75rem 1.5rem',
        borderBottom: '3px solid transparent',
        color: '#666',
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        fontSize: '0.95rem',
        transition: 'all 0.2s ease',
      };
    }

    if (variant === 'pills') {
      return {
        padding: '0.5rem 1rem',
        background: 'white',
        color: '#333',
        border: '1px solid #e0e0e0',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
      };
    }

    return {
      padding: '0.5rem 1rem',
      background: 'white',
      color: '#333',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'all 0.2s ease',
    };
  };

  return (
    <div style={containerStyle}>
      {statusKeys.map((status) => {
        const isActive = selectedStatus === status;
        const isAll = status === 'TODOS';
        const config = isAll ? { label: 'Todos', icon: '📋' } : statuses[status];
        const count = counts[status] || 0;

        return (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            style={buttonStyle(status, isActive)}
            onMouseEnter={(e) => {
              if (!isActive && variant !== 'tabs') {
                (e.target as HTMLButtonElement).style.background = '#f5f5f5';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && variant !== 'tabs') {
                (e.target as HTMLButtonElement).style.background = 'white';
              }
            }}
          >
            {config.icon} {config.label} ({count})
          </button>
        );
      })}
    </div>
  );
};
