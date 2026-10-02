import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  caption?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
}) => {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur-md transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 text-neutral-200">
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-neutral-100">{title}</h4>
          {caption && <p className="text-xs text-neutral-400 mt-0.5">{caption}</p>}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 transition-colors"
            title="Reduzir Zoom"
            aria-label="Reduzir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-neutral-400 tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 transition-colors"
            title="Aumentar Zoom"
            aria-label="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 transition-colors"
            title="Girar Imagem"
            aria-label="Girar Imagem"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 ml-2 rounded-lg bg-neutral-800/80 hover:bg-red-900/60 hover:text-red-200 text-neutral-300 transition-colors"
            title="Fechar (Esc)"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className="flex-1 flex items-center justify-center p-6 overflow-hidden select-none cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.15s ease-out',
            maxHeight: '85vh',
            maxWidth: '90vw',
          }}
          className="object-contain shadow-2xl rounded-sm ring-1 ring-white/10"
        />
      </div>

      {/* Bottom Hint */}
      <div className="px-6 py-2.5 text-center text-xs text-neutral-500 border-t border-neutral-900">
        Pressione <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[11px]">ESC</kbd> para fechar ou clique fora da imagem
      </div>
    </div>
  );
};
