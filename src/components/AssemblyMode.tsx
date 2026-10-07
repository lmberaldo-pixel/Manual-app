import React, { useState, useEffect } from 'react';
import { EquipmentProject, AssemblyStep, StepImage } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  RotateCcw,
  Clock,
  Wrench,
  AlertTriangle,
  Lightbulb,
  ZoomIn,
  Images,
  PartyPopper,
  FileText,
  Sliders,
} from 'lucide-react';

interface AssemblyModeProps {
  project: EquipmentProject;
  onExitToEditor: () => void;
  onOpenLightbox: (url: string, title: string, caption?: string) => void;
}

export const AssemblyMode: React.FC<AssemblyModeProps> = ({
  project,
  onExitToEditor,
  onOpenLightbox,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const steps = project.steps;
  const currentStep: AssemblyStep | undefined = steps[currentStepIndex];

  // Reset active photo index when changing steps
  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [currentStepIndex]);

  // Assembly stopwatch timer
  useEffect(() => {
    if (!isTimerRunning || isFinished) return;
    const interval = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isFinished]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' && currentStepIndex < steps.length - 1) {
        handleNextStep();
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        handlePrevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, steps.length]);

  if (!steps || steps.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
          <Wrench className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Nenhuma etapa cadastrada</h3>
        <p className="text-sm text-neutral-400 mb-6 max-w-md mx-auto">
          Para iniciar a montagem do equipamento, adicione as etapas sequenciais com fotos e instruções no Editor.
        </p>
        <button
          onClick={onExitToEditor}
          className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition-colors"
        >
          Ir para o Editor de Etapas →
        </button>
      </div>
    );
  }

  // Format stopwatch seconds into mm:ss or hh:mm:ss
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleNextStep = () => {
    if (currentStep) {
      setCompletedSteps((prev) => ({ ...prev, [currentStep.id]: true }));
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      setIsFinished(true);
      setIsTimerRunning(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  };

  const toggleCheckpoint = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compile all photos for current step (main photo + additional photos)
  const allCurrentPhotos: { url: string; caption?: string; isMain: boolean }[] = currentStep
    ? [
        { url: currentStep.mainImage, caption: currentStep.subtitle, isMain: true },
        ...(currentStep.additionalImages || []).map((img) => ({
          url: img.url,
          caption: img.caption,
          isMain: false,
        })),
      ]
    : [];

  const activePhoto = allCurrentPhotos[selectedPhotoIndex] || allCurrentPhotos[0];
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  // Completion Screen
  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-xl">
          <PartyPopper className="w-10 h-10" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Sucesso na Montagem
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-3">
          {project.name} Concluído!
        </h2>
        <p className="text-sm text-neutral-300 max-w-lg mx-auto mb-8 leading-relaxed">
          Parabéns! Todas as {steps.length} etapas sequenciais do manual de montagem foram executadas e verificadas com sucesso.
        </p>

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 mb-8 max-w-md mx-auto">
          <div className="text-center">
            <span className="block text-[11px] text-neutral-400">Tempo Total</span>
            <span className="text-base font-bold text-white font-mono tabular-nums">
              {formatTime(secondsElapsed)}
            </span>
          </div>
          <div className="text-center border-x border-neutral-800">
            <span className="block text-[11px] text-neutral-400">Etapas Feitas</span>
            <span className="text-base font-bold text-amber-400 font-mono tabular-nums">
              {steps.length}/{steps.length}
            </span>
          </div>
          <div className="text-center">
            <span className="block text-[11px] text-neutral-400">Status</span>
            <span className="text-base font-bold text-emerald-400">100% OK</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              setIsFinished(false);
              setCurrentStepIndex(0);
              setSecondsElapsed(0);
              setIsTimerRunning(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar Montagem</span>
          </button>

          <button
            onClick={onExitToEditor}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-lg shadow-amber-950/20"
          >
            <Sliders className="w-4 h-4" />
            <span>Voltar ao Editor do Projeto</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Assembly Workbench Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center px-2.5 py-1 rounded-md bg-amber-400 text-neutral-950 font-bold text-xs font-mono">
              ETAPA {String(currentStepIndex + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </span>
            <span className="text-xs text-neutral-400 truncate max-w-xs sm:max-w-md">
              {project.name}
            </span>
          </div>

          {/* Assembly Stopwatch & Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>

            <button
              onClick={() => setIsTimerRunning((r) => !r)}
              className="text-[11px] text-neutral-400 hover:text-white underline decoration-neutral-700"
            >
              {isTimerRunning ? 'Pausar' : 'Continuar'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
          <div
            className="bg-amber-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500 font-mono">
          <span>{progressPercent}% Concluído</span>
          <span>Navegue com [←] e [→]</span>
        </div>
      </div>

      {/* Main Step Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Assembly Photography & Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Main Visual Frame */}
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-xl group">
            {activePhoto ? (
              <img
                src={activePhoto.url}
                alt={currentStep?.title || 'Foto de montagem'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-neutral-950 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-600 text-xs">
                Sem foto para esta etapa
              </div>
            )}

            {/* Click to Zoom Overlay Button */}
            {activePhoto && (
              <button
                onClick={() =>
                  onOpenLightbox(
                    activePhoto.url,
                    `${currentStep?.title} (Foto #${selectedPhotoIndex + 1})`,
                    activePhoto.caption || currentStep?.subtitle
                  )
                }
                className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-neutral-700/80 text-white text-xs font-medium hover:bg-neutral-900 transition-colors shadow-lg"
              >
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Ampliar Detalhes</span>
              </button>
            )}

            {/* Photo Type Indicator */}
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md border border-neutral-700/80 text-white text-[11px] font-mono">
              {activePhoto?.isMain ? 'Foto Principal' : `Foto Adicional #${selectedPhotoIndex}`}
            </div>
          </div>

          {/* Additional Photos Mini Carousel Strip ("opção de mais fotos") */}
          {allCurrentPhotos.length > 1 && (
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5 px-1">
                <span className="flex items-center gap-1">
                  <Images className="w-3.5 h-3.5 text-amber-400" />
                  Galeria de Fotos Desta Etapa ({allCurrentPhotos.length}):
                </span>
                <span className="text-[11px] text-neutral-500">Clique para alternar visão</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {allCurrentPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border flex-shrink-0 transition-all ${
                      selectedPhotoIndex === idx
                        ? 'border-amber-400 ring-2 ring-amber-400/40 scale-102'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`Miniatura ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain bg-neutral-950"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-neutral-950/80 text-[9px] text-white text-center py-0.5 truncate px-1">
                      {photo.isMain ? 'Principal' : `Foto ${idx + 1}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Step Description, Subtitle & Detailed Instructions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl space-y-5">
            {/* Title & Subtitle */}
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
                Sequência #{currentStep?.stepNumber}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                {currentStep?.title}
              </h3>
              <p className="text-sm font-semibold text-amber-300/90 mt-1 leading-snug">
                {currentStep?.subtitle}
              </p>
            </div>

            {/* Tools required for this step */}
            {currentStep?.tools && currentStep.tools.length > 0 && (
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 mb-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ferramentas & Peças Necessárias</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentStep.tools.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs bg-neutral-900 border border-neutral-700/60 text-neutral-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Instruções Detalhadas
              </h4>
              <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800 text-sm text-neutral-200 leading-relaxed whitespace-pre-line space-y-2">
                {currentStep?.description}
              </div>
            </div>

            {/* Warning Callout */}
            {currentStep?.warning && (
              <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-900/60 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Atenção Crítica
                  </span>
                  <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
                    {currentStep.warning}
                  </p>
                </div>
              </div>
            )}

            {/* Pro Tip Callout */}
            {currentStep?.tip && (
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-neutral-300">
                    Dica de Oficina
                  </span>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    {currentStep.tip}
                  </p>
                </div>
              </div>
            )}

            {/* Quality Checklist */}
            {currentStep?.checkpoints && currentStep.checkpoints.length > 0 && (
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Pontos de Verificação & Qualidade:
                </span>
                <div className="space-y-2">
                  {currentStep.checkpoints.map((cp) => {
                    const isChecked = Boolean(checkedItems[cp.id]);
                    return (
                      <label
                        key={cp.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheckpoint(cp.id)}
                          className="mt-0.5 rounded border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <span className={isChecked ? 'line-through text-emerald-300/80' : ''}>
                          {cp.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-800">
              <button
                disabled={currentStepIndex === 0}
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Etapa Anterior</span>
              </button>

              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-lg shadow-amber-950/20"
              >
                <span>
                  {currentStepIndex === steps.length - 1 ? 'Concluir Montagem' : 'Próxima Etapa'}
                </span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
