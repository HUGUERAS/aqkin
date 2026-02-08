interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStep?: string;
  percentage: number;
}

export default function ProgressTracker({ steps, currentStep, percentage }: ProgressTrackerProps) {
  return (
    <div>
      {/* Progress bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          flex: 1,
          height: '6px',
          background: 'rgba(59, 130, 246, 0.15)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: percentage === 100
              ? '#10b981'
              : 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
            borderRadius: '3px',
            transition: 'width 500ms ease',
          }} />
        </div>
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: percentage === 100 ? '#10b981' : '#94a3b8',
          minWidth: '3rem',
          textAlign: 'right',
        }}>
          {percentage}%
        </span>
      </div>

      {/* Steps list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: isCurrent
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(15, 23, 42, 0.5)',
                borderRadius: '8px',
                border: isCurrent
                  ? '1px solid rgba(59, 130, 246, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Step indicator */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.75rem',
                fontWeight: 700,
                background: step.completed
                  ? '#10b981'
                  : isCurrent
                    ? '#3b82f6'
                    : 'rgba(255, 255, 255, 0.1)',
                color: step.completed || isCurrent ? '#ffffff' : '#94a3b8',
              }}>
                {step.completed ? '\u2713' : index + 1}
              </div>

              {/* Label */}
              <span style={{
                fontSize: '0.9rem',
                fontWeight: isCurrent ? 600 : 400,
                color: step.completed
                  ? '#10b981'
                  : isCurrent
                    ? '#e5e7eb'
                    : '#94a3b8',
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
