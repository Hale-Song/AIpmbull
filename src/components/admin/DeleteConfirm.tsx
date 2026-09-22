interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DeleteConfirm({ onConfirm, onCancel, confirmLabel = "Confirm", cancelLabel = "Cancel" }: DeleteConfirmProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onConfirm}
        className="rounded bg-red-600 px-2 py-0.5 text-xs text-white"
      >
        {confirmLabel}
      </button>
      <button
        onClick={onCancel}
        className="rounded bg-slate-700 px-2 py-0.5 text-xs text-white"
      >
        {cancelLabel}
      </button>
    </div>
  );
}
