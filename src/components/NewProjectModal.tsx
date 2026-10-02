import React, { useState, useRef } from 'react';
import { EquipmentProject } from '../types';
import { PRESET_EQUIPMENT_IMAGES, fileToOptimizedDataUrl } from '../utils/storage';
import { Upload, Image as ImageIcon, X, Wrench, Sparkles, Check } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: EquipmentProject) => void;
  isInitialPrompt?: boolean;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  isInitialPrompt = false,
}) => {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [coverImage, setCoverImage] = useState<string>(PRESET_EQUIPMENT_IMAGES[0].url);
  const [category, setCategory] = useState('Mecânica & Robótica');
  const [difficulty, setDifficulty] = useState<'Iniciante' | 'Intermediário' | 'Avançado' | 'Especialista'>('Intermediário');
  const [estimatedHours, setEstimatedHours] = useState('2h');
  const [generalDescription, setGeneralDescription] = useState('');
  const [toolsInput, setToolsInput] = useState('Chaves Allen, Alicate de corte, Fita métrica');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const dataUrl = await fileToOptimizedDataUrl(file);
      setCoverImage(dataUrl);
    } catch (err) {
      console.error('Failed to read image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tools = toolsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newProject: EquipmentProject = {
      id: `project-${Date.now()}`,
      name: name.trim(),
      subtitle: subtitle.trim() || undefined,
      coverImage: coverImage || PRESET_EQUIPMENT_IMAGES[0].url,
      category,
      difficulty,
      estimatedHours: estimatedHours.trim() || '1h 30min',
      generalDescription: generalDescription.trim() || 'Guia técnico detalhado para montagem do equipamento.',
      toolsRequired: tools.length > 0 ? tools : ['Ferramental padrão de bancada'],
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateProject(newProject);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {isInitialPrompt ? 'Boas-vindas ao MontaTech' : 'Novo Equipamento'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {isInitialPrompt ? 'Iniciar Novo Manual de Montagem' : 'Cadastrar Equipamento'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Informe o nome do projeto e selecione a foto de capa principal do equipamento.
            </p>
          </div>

          {!isInitialPrompt && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Nome do Projeto / Equipamento <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Montagem da Impressora 3D CoreXY, Braço Robótico, Mesa Articulada..."
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Subtítulo do Projeto (Opcional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: Instruções de alinhamento cinemático, fixação de trilhos e fiação"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>

          {/* Cover Image Upload & Presets */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Imagem de Capa do Equipamento <span className="text-amber-400">*</span>
            </label>

            {/* Current Cover Preview */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 group mb-3">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Imagem de Capa"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs">Nenhuma imagem selecionada</span>
                </div>
              )}

              <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-lg bg-neutral-800 text-white text-xs font-medium hover:bg-neutral-700 transition-colors flex items-center gap-1.5 shadow-lg"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Substituir Foto
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Presets or Upload button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isUploading ? 'Processando foto...' : 'Fazer Upload do Seu Dispositivo'}
                </button>
              </div>

              <span className="text-[11px] text-neutral-400">
                Ou selecione uma foto de exemplo:
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PRESET_EQUIPMENT_IMAGES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCoverImage(preset.url)}
                  className={`relative aspect-video rounded-md overflow-hidden border transition-all text-left group ${
                    coverImage === preset.url
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                    <span className="text-[10px] text-white font-medium truncate">
                      {preset.name}
                    </span>
                  </div>
                  {coverImage === preset.url && (
                    <div className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-400 text-neutral-950">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category, Difficulty & Estimated Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Mecânica & Robótica">Mecânica & Robótica</option>
                <option value="Impressão 3D & CNC">Impressão 3D & CNC</option>
                <option value="Eletrônica & IoT">Eletrônica & IoT</option>
                <option value="Mobiliário & Estruturas">Mobiliário & Estruturas</option>
                <option value="Manutenção Industrial">Manutenção Industrial</option>
                <option value="Outro Equipamento">Outro Equipamento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Dificuldade
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
                <option value="Especialista">Especialista</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Tempo Estimado
              </label>
              <input
                type="text"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="Ex: 2h 30min"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
              </input>
            </div>
          </div>

          {/* Tools required */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Ferramentas Principais Necessárias (separadas por vírgula)
            </label>
            <input
              type="text"
              value={toolsInput}
              onChange={(e) => setToolsInput(e.target.value)}
              placeholder="Ex: Chave Allen 3mm, Alicate de corte, Ferro de solda..."
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            {!isInitialPrompt && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={!name.trim() || isUploading}
              className="px-5 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-lg shadow-amber-950/20"
            >
              Criar Projeto e Começar Montagem →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
