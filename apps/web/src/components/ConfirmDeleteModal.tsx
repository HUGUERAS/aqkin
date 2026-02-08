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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal"
      style={{ padding: overlayPadding }}
      onClick={() => !busy && onCancel()}
    >
      <div
        className="bg-white rounded-lg p-8"
        style={{
          maxWidth,
          width,
          boxShadow: boxShadow || 'var(--shadow-2xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mt-0 text-lg font-semibold text-titanium-900">{title}</h3>
        <p className="text-titanium-700">{message}</p>
        <div className="flex gap-4 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-6 py-3 bg-secondary text-titanium-900 border-none rounded-md transition-all hover:bg-secondary-hover disabled:opacity-50 disabled:cursor-wait"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-6 py-3 bg-error text-white border-none rounded-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-wait"
          >
            {busy ? confirmingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
