'use client';

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busyLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Modal konfirmasi berbasis elemen native <dialog>: top layer, focus trap, dan
// dukungan Esc sudah ditangani browser. State `open` tetap dikendalikan React.
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  busyLabel = 'Memproses...',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        // Esc tidak menutup dialog secara langsung; biar React yang mengatur.
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        // Klik pada backdrop: target-nya tepat elemen <dialog> itu sendiri.
        if (e.target === ref.current && !busy) onCancel();
      }}
      className="m-auto w-[min(92vw,26rem)] rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-xl backdrop:bg-black/40"
    >
      <div className="p-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="mt-2 text-sm break-words text-neutral-600">
            {description}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 border-t border-neutral-100 px-5 py-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          autoFocus
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
