import React from 'react';
import { AssemblyStep } from '../types';
import {
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Images,
  Wrench,
  CheckSquare,
  AlertTriangle,
  ZoomIn,
} from 'lucide-react';

interface StepCardProps {
  step: AssemblyStep;
  index: number;
  totalSteps: number;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpenImage: (url: string, title: string, caption?: string) => void;
}

export const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  totalSteps,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onOpenImage,
}) => {
  const isFirst = index === 0;
  const isLast = index === totalSteps - 1;

  return (
    <div className="relative group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all shadow-md">
      <div className="flex flex-col md:flex-row">
        {/* Step Sequence Indicator & Photos Area */}
        <div className="relative w-full md:w-72 lg:w-80 flex-shrink-0 bg-neutral-950 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col justify-between">
          {/* Main Photo with Lightbox trigger */}
          <div className="relative aspect-video md:aspect-[4/3] w-full overflow-hidden group/img">
            <img
              src={step.mainImage}
              alt={step.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
            />

            {/* Sequence Number Watermark Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md border border-neutral-700/80 text-white font-mono text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Etapa {String(step.stepNumber).padStart(2, '0')}
            </div>

            {/* Inspect / Zoom Button */}
            <button
              onClick={() => onOpenImage(step.mainImage, step.title, step.subtitle)}
              className="absolute top-3 right-3 p-1.5 rounded-md bg-neutral-950/80 backdrop-blur-md text-neutral-300 hover:text-white border border-neutral-700/80 opacity-0 group-hover/img:opacity-100 transition-opacity"
              title="Ampliar Foto Principal"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Additional Photos Indicator Badge */}
            {step.additionalImages && step.additionalImages.length > 0 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-950/80 backdrop-blur-md border border-neutral-700/80 text-[11px] text-amber-300 font-medium">
                <Images className="w-3.5 h-3.5" />
                +{step.additionalImages.length} {step.additionalImages.length === 1 ? 'foto extra' : 'fotos extras'}
              </div>
            )}
          </div>

          {/* Additional Photos Mini Strip (if any) */}
          {step.additionalImages && step.additionalImages.length > 0 && (
            <div className="p-2.5 bg-neutral-950/80 border-t border-neutral-800/80 flex items-center gap-2 overflow-x-auto">
              {step.additionalImages.map((extra, idx) => (
                <button
                  key={extra.id || idx}
                  onClick={() =>
                    onOpenImage(
                      extra.url,
                      `${step.title} - Foto Adicional #${idx + 1}`,
                      extra.caption
                    )
                  }
                  className="relative w-12 h-9 rounded overflow-hidden border border-neutral-800 hover:border-amber-400 transition-colors flex-shrink-0 group/extra"
                  title={extra.caption || `Ver foto adicional ${idx + 1}`}
                >
                  <img
                    src={extra.url}
                    alt={extra.caption || 'Foto extra'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover/extra:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-3 h-3 text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Title & Subtitle */}
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <span>Sequência #{step.stepNumber}</span>
                {step.estimatedMinutes && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">~{step.estimatedMinutes} min</span>
                  </>
                )}
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">{step.title}</h4>
              <p className="text-sm font-medium text-amber-400/90 mt-0.5">{step.subtitle}</p>
            </div>

            {/* Detailed Description */}
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-3 sm:line-clamp-4 whitespace-pre-line mb-4 font-normal">
              {step.description}
            </p>

            {/* Badges / Warnings / Tools */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
              {step.tools && step.tools.length > 0 && (
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate max-w-[240px]">{step.tools.join(', ')}</span>
                </div>
              )}

              {step.checkpoints && step.checkpoints.length > 0 && (
                <div className="flex items-center gap-1 text-neutral-400">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{step.checkpoints.length} pontos de conferência</span>
                </div>
              )}

              {step.warning && (
                <div className="flex items-center gap-1 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate max-w-[200px]">Atenção incluída</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Toolbar Bottom */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-neutral-800/80">
            {/* Reorder Buttons (Sequential Flow) */}
            <div className="flex items-center gap-1">
              <button
                disabled={isFirst}
                onClick={onMoveUp}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Mover etapa para cima na sequência"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                disabled={isLast}
                onClick={onMoveDown}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Mover etapa para baixo na sequência"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-neutral-500 font-mono ml-1.5">
                Posição {index + 1} de {totalSteps}
              </span>
            </div>

            {/* Edit / Delete Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Editar</span>
              </button>

              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-900/40 rounded-lg transition-colors"
                title="Excluir etapa"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
