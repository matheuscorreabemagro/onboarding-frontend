'use client';

import Button from '../ui/Button';

interface DeletePopupProps {
  position: { x: number; y: number };
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeletePopup({ position, onConfirm, onClose }: DeletePopupProps) {
  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl p-2 z-100 border border-red-400"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -120%)',
      }}
    >
      <div className="flex gap-2">
        <Button
          onClick={onClose}
          variant="secondary"
          size="sm"
          className="text-xs"
          title="Cancelar"
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="danger"
          size="sm"
          className="text-xs flex items-center gap-1"
          title="Excluir linha"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Excluir
        </Button>
      </div>
    </div>
  );
}
