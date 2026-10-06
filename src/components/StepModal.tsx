import React, { useState, useRef, useEffect } from 'react';
import { AssemblyStep, StepImage, CheckpointItem } from '../types';
import { fileToOptimizedDataUrl } from '../utils/storage';
import {
  Upload,
  Plus,
  Trash2,
  AlertTriangle,
  Lightbulb,
  Wrench,
  CheckSquare,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStep: (step: AssemblyStep) => void;
  initialStep?: AssemblyStep | null;
  nextStepNumber: number;
  allSteps?: AssemblyStep[];
  onNavigateStep?: (step: AssemblyStep) => void;
}

export const StepModal: React.FC<StepModalProps> = ({
  isOpen,
  onClose,
  onSaveStep,
  initialStep,
  nextStepNumber,
  allSteps,
  onNavigateStep,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [mainImage, setMainImage] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<StepImage[]>([]);
  const [description, setDescription] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [warning, setWarning] = useState('');
  const [tip, setTip] = useState('');
  const [checkpoints, setCheckpoints] = useState<CheckpointItem[]>([]);
  const [newCheckpointText, setNewCheckpointText] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(15);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingExtra, setIsUploadingExtra] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when editing existing step or adding new
  useEffect(() => {
    if (initialStep) {
      setTitle(initialStep.title);
      setSubtitle(initialStep.subtitle);
      setMainImage(initialStep.mainImage);
      setAdditionalImages(initialStep.additionalImages || []);
      setDescription(initialStep.description);
      setToolsInput((initialStep.tools || []).join(', '));
      setWarning(initialStep.warning || '');
      setTip(initialStep.tip || '');
      setCheckpoints(initialStep.checkpoints || []);
      setEstimatedMinutes(initialStep.estimatedMinutes || 15);
    } else {
      // Default new step
      setTitle('');
      setSubtitle('');
      setMainImage('');
      setAdditionalImages([]);
      setDescription('');
      setToolsInput('');
      setWarning('');
      setTip('');
      setCheckpoints([]);
      setEstimatedMinutes(15);
    }
  }, [initialStep, nextStepNumber, isOpen]);

  if (!isOpen) return null;

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingMain(true);
      const dataUrl = await fileToOptimizedDataUrl(file);
      setMainImage(dataUrl);
    } catch (err) {
      console.error('Failed to upload main image:', err);
    } finally {
      setIsUploadingMain(false);
    }
  };

  const handleExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploadingExtra(true);
      const newImages: StepImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await fileToOptimizedDataUrl(files[i]);
        newImages.push({
          id: `img-${Date.now()}-${i}`,
          url: dataUrl,
          caption: '',
        });
      }
      setAdditionalImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error('Failed to upload extra images:', err);
    } finally {
      setIsUploadingExtra(false);
    }
  };

  const handleRemoveExtraImage = (id: string) => {
    setAdditionalImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleUpdateExtraImageCaption = (id: string, caption: string) => {
    setAdditionalImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  const handleAddCheckpoint = () => {
    if (!newCheckpointText.trim()) return;
    setCheckpoints((prev) => [
      ...prev,
      {
        id: `cp-${Date.now()}`,
        text: newCheckpointText.trim(),
        completed: false,
      },
    ]);
    setNewCheckpointText('');
  };

  const handleRemoveCheckpoint = (id: string) => {
    setCheckpoints((prev) => prev.filter((cp) => cp.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mainImage) return;

    const tools = toolsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const stepToSave: AssemblyStep = {
      id: initialStep ? initialStep.id : `step-${Date.now()}`,
      stepNumber: initialStep ? initialStep.stepNumber : nextStepNumber,
      title: title.trim(),
      subtitle: subtitle.trim(),
      mainImage,
      additionalImages,
      description: description.trim(),
      tools: tools.length > 0 ? tools : undefined,
      warning: warning.trim() || undefined,
      tip: tip.trim() || undefined,
      checkpoints: checkpoints.length > 0 ? checkpoints : undefined,
      estimatedMinutes: Number(estimatedMinutes) || 15,
    };

    onSaveStep(stepToSave);
    onClose();
  };

  const currentStepNumber = initialStep ? initialStep.stepNumber : nextStepNumber;

  const currentIndex = allSteps && initialStep ? allSteps.findIndex((s) => s.id === initialStep.id) : -1;
  const prevStep = currentIndex > 0 && allSteps ? allSteps[currentIndex - 1] : null;
  const nextStep = currentIndex >= 0 && currentIndex < (allSteps?.length || 0) - 1 && allSteps ? allSteps[currentIndex + 1] : null;

  const handleGoToStep = (targetStep: AssemblyStep | null) => {
    if (!targetStep || !onNavigateStep) return;
    if (title.trim() && mainImage) {
      const tools = toolsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const stepToSave: AssemblyStep = {
        id: initialStep ? initialStep.id : `step-${Date.now()}`,
        stepNumber: initialStep ? initialStep.stepNumber : nextStepNumber,
        title: title.trim(),
        subtitle: subtitle.trim(),
        mainImage,
        additionalImages,
        description: description.trim(),
        tools: tools.length > 0 ? tools : undefined,
        warning: warning.trim() || undefined,
        tip: tip.trim() || undefined,
        checkpoints: checkpoints.length > 0 ? checkpoints : undefined,
        estimatedMinutes: Number(estimatedMinutes) || 15,
      };
      onSaveStep(stepToSave);
    }
    onNavigateStep(targetStep);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Header with Sequence Indicator */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 font-bold text-sm">
              #{currentStepNumber}
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialStep ? `Editar Etapa #${currentStepNumber}` : `Adicionar Etapa #${currentStepNumber} na Sequência`}
              </h3>
              <p className="text-xs text-neutral-400">
                Defina o título, subtítulo, foto principal, fotos adicionais e a descrição detalhada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {initialStep && allSteps && allSteps.length > 1 && (
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  type="button"
                  onClick={() => handleGoToStep(prevStep)}
                  disabled={!prevStep}
                  title={prevStep ? `Ir para Etapa Anterior (#${prevStep.stepNumber})` : 'Primeira etapa'}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors border border-neutral-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Etapa Anterior</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGoToStep(nextStep)}
                  disabled={!nextStep}
                  title={nextStep ? `Ir para Próxima Etapa (#${nextStep.stepNumber})` : 'Última etapa'}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors border border-neutral-700"
                >
                  <span>Próxima Etapa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* TÍTULO & SUBTÍTULO */}
          <div className="space-y-4 p-4 rounded-lg bg-neutral-950/50 border border-neutral-800">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Título da Etapa <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Fixação dos Motores de Passo no Chassi"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Subtítulo da Etapa <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Alinhamento do eixo X e aperto dos parafusos M4 com chave Allen 3mm"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* FOTO PRINCIPAL & MAIS FOTOS */}
          <div className="space-y-4 p-4 rounded-lg bg-neutral-950/50 border border-neutral-800">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Foto Principal da Sequência <span className="text-amber-400">*</span>
                </label>
                <span className="text-[11px] text-neutral-400">
                  Foto em destaque para o montador
                </span>
              </div>

              {/* Main Photo Preview */}
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900 group">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={title || 'Foto da Etapa'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">Nenhuma foto principal selecionada</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => mainFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-lg bg-neutral-800 text-white text-xs font-medium hover:bg-neutral-700 transition-colors flex items-center gap-1.5 shadow-lg"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Trocar Foto Principal
                  </button>
                </div>
              </div>

              <input
                ref={mainFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMainImageUpload}
              />

              <div className="flex items-center justify-start mt-2">
                <button
                  type="button"
                  disabled={isUploadingMain}
                  onClick={() => mainFileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-semibold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isUploadingMain ? 'Enviando foto...' : 'Carregar Foto do Dispositivo'}
                </button>
              </div>
            </div>

            {/* OPÇÃO DE MAIS FOTOS (Fotos adicionais de detalhe/ângulos) */}
            <div className="pt-3 border-t border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-300">
                    Fotos Adicionais da Etapa ({additionalImages.length})
                  </label>
                  <p className="text-[11px] text-neutral-400">
                    Adicione fotos extras de ângulos, detalhes de conectores, parafusos ou esquemas.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isUploadingExtra}
                  onClick={() => extraFileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  {isUploadingExtra ? 'Processando...' : '+ Adicionar Mais Fotos'}
                </button>
              </div>

              <input
                ref={extraFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleExtraImageUpload}
              />

              {/* Gallery of Additional Photos */}
              {additionalImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {additionalImages.map((img, index) => (
                    <div
                      key={img.id}
                      className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-900 border border-neutral-800"
                    >
                      <div className="w-20 h-16 rounded overflow-hidden bg-neutral-950 flex-shrink-0 border border-neutral-800">
                        <img
                          src={img.url}
                          alt={`Detalhe ${index + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-neutral-400 font-medium">
                          Foto adicional #{index + 1}
                        </span>
                        <input
                          type="text"
                          value={img.caption || ''}
                          onChange={(e) => handleUpdateExtraImageCaption(img.id, e.target.value)}
                          placeholder="Legenda da foto (ex: detalhe do fio vermelho)"
                          className="w-full mt-1 px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraImage(img.id)}
                        className="p-1 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
                        title="Remover foto adicional"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed border-neutral-800 rounded-lg text-neutral-500 text-xs">
                  Nenhuma foto adicional adicionada ainda. Clique no botão acima para adicionar fotos extras de suporte.
                </div>
              )}
            </div>
          </div>

          {/* DESCRIÇÃO DETALHADA DO PROCESSO */}
          <div className="space-y-3 p-4 rounded-lg bg-neutral-950/50 border border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                Descrição Detalhada do Processo de Montagem <span className="text-amber-400">*</span>
              </label>

              {/* Fast Insert Badges */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setDescription((d) =>
                      d ? `${d}\n\n1. Posicionar...\n2. Fixar com torque leve...\n3. Conferir alinhamento...` : '1. Posicionar...\n2. Fixar com torque leve...\n3. Conferir alinhamento...'
                    )
                  }
                  className="px-2 py-0.5 text-[10px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
                >
                  + Passo a Passo
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDescription((d) =>
                      d ? `${d}\n\n⚠️ Atenção: Certifique-se de que os cabos não estejam sob tensão mecânica.` : '⚠️ Atenção: Certifique-se de que os cabos não estejam sob tensão mecânica.'
                    )
                  }
                  className="px-2 py-0.5 text-[10px] font-medium bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/40 rounded"
                >
                  + Alerta
                </button>
              </div>
            </div>

            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva minuciosamente cada ação do montador: peças a separar, direção de encaixe, ordem de aperto dos parafusos, pontos de verificação e cuidados mecânicos ou elétricos..."
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* FERRAMENTAS, ALERTA E DICA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 mb-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                Ferramentas / Peças Desta Etapa (separadas por vírgula)
              </label>
              <input
                type="text"
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                placeholder="Ex: Chave Allen 3mm, 4x Parafusos M4x10, Porcas T"
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 mb-1.5">
                Tempo Estimado da Etapa (minutos)
              </label>
              <input
                type="number"
                min={1}
                max={480}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Aviso de Segurança / Atenção (Opcional)
              </label>
              <input
                type="text"
                value={warning}
                onChange={(e) => setWarning(e.target.value)}
                placeholder="Ex: Não ligue a fonte antes de conferir a polaridade (+ e -)"
                className="w-full px-3.5 py-2 bg-neutral-950 border border-amber-900/60 rounded-lg text-xs text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Dica do Montador / Macete Técnico (Opcional)
              </label>
              <input
                type="text"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                placeholder="Ex: Passe um pouco de graxa de silicone nos fusos antes de rosquear"
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* CHECKLIST DE CONFERÊNCIA (Opcional) */}
          <div className="p-4 rounded-lg bg-neutral-950/50 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                Lista de Conferência de Qualidade / Checkpoints
              </label>
              <span className="text-[11px] text-neutral-400">
                O montador marcará cada item no modo montagem
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCheckpointText}
                onChange={(e) => setNewCheckpointText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCheckpoint();
                  }
                }}
                placeholder="Ex: Conferir se o rolamento gira sem folga lateral"
                className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCheckpoint}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
              >
                + Adicionar Item
              </button>
            </div>

            {checkpoints.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {checkpoints.map((cp) => (
                  <div
                    key={cp.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300"
                  >
                    <span>✓ {cp.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckpoint(cp.id)}
                      className="text-neutral-500 hover:text-red-400 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!title.trim() || !mainImage}
              className="px-5 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-lg shadow-amber-950/20"
            >
              {initialStep ? 'Salvar Alterações da Etapa' : `Adicionar Etapa #${currentStepNumber} à Sequência →`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
