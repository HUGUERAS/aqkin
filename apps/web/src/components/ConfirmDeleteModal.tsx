type ConfirmDeleteModalProps = {
  open: boolean;
  busy: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  cancelLabel?: string;
  width?: string;
  maxWidth?: string;
  overlayPadding?: string;
  boxShadow?: string;
};

export default function ConfirmDeleteModal({
  open,
  busy,
  message,
  onCancel,
  onConfirm,
  title = 'Confirmar Exclusão',
  confirmLabel = 'Excluir',
  confirmingLabel = 'Excluindo...',
  cancelLabel = 'Cancelar',
  width = '90%',
  maxWidth = '400px',
  overlayPadding = '0',
  boxShadow,
}: ConfirmDeleteModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: overlayPadding,
      }}
      onClick={() => !busy && onCancel()}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth,
          width,
          boxShadow,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            onClick={onCancel}
            disabled={busy}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            {busy ? confirmingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
