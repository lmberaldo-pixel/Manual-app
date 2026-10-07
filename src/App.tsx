import React, { useState, useEffect, useMemo } from 'react';
import { ViewMode, EquipmentProject, AssemblyStep } from './types';
import {
  loadAllProjects,
  saveAllProjects,
  getCurrentProjectId,
  setCurrentProjectId,
  exportProjectToJson,
} from './utils/storage';
import { Header } from './components/Header';
import { StepCard } from './components/StepCard';
import { StepModal } from './components/StepModal';
import { NewProjectModal } from './components/NewProjectModal';
import { AssemblyMode } from './components/AssemblyMode';
import { ManualView } from './components/ManualView';
import { ImageLightbox } from './components/ImageLightbox';
import {
  Plus,
  Play,
  FileText,
  Wrench,
  Clock,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  Trash2,
  PenTool,
  FolderArchive,
} from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<EquipmentProject[]>(() => loadAllProjects());
  const [currentId, setCurrentId] = useState<string>(() => getCurrentProjectId());
  const [viewMode, setViewMode] = useState<ViewMode>('editor');

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<AssemblyStep | null>(null);

  // Lightbox state
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    caption?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
  });

  // Current active project
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === currentId) || projects[0] || null;
  }, [projects, currentId]);

  // Sync to storage
  useEffect(() => {
    saveAllProjects(projects);
  }, [projects]);

  useEffect(() => {
    setCurrentProjectId(currentId);
  }, [currentId]);

  // Lightbox openers
  const handleOpenLightbox = (imageUrl: string, title: string, caption?: string) => {
    setLightboxState({
      isOpen: true,
      imageUrl,
      title,
      caption,
    });
  };

  const handleCloseLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  // Step operations
  const handleSaveStep = (stepToSave: AssemblyStep) => {
    if (!currentProject) return;

    let updatedSteps = [...currentProject.steps];
    const existingIndex = updatedSteps.findIndex((s) => s.id === stepToSave.id);

    if (existingIndex >= 0) {
      updatedSteps[existingIndex] = stepToSave;
    } else {
      updatedSteps.push({
        ...stepToSave,
        stepNumber: updatedSteps.length + 1,
      });
    }

    // Re-index stepNumbers strictly 1..N
    updatedSteps = updatedSteps.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
    }));

    const updatedProject: EquipmentProject = {
      ...currentProject,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? updatedProject : p)));
    setEditingStep(null);
  };

  const handleDeleteStep = (stepId: string) => {
    if (!currentProject) return;
    if (!confirm('Deseja realmente remover esta etapa da sequência?')) return;

    let updatedSteps = currentProject.steps.filter((s) => s.id !== stepId);
    updatedSteps = updatedSteps.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
    }));

    const updatedProject: EquipmentProject = {
      ...currentProject,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? updatedProject : p)));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (!currentProject) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentProject.steps.length) return;

    const newSteps = [...currentProject.steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    // Re-index stepNumbers
    const reindexedSteps = newSteps.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
    }));

    const updatedProject: EquipmentProject = {
      ...currentProject,
      steps: reindexedSteps,
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? updatedProject : p)));
  };

  const handleCreateProject = (newProj: EquipmentProject) => {
    setProjects((prev) => [newProj, ...prev]);
    setCurrentId(newProj.id);
    setViewMode('editor');
    // Open step modal automatically for the first step
    setTimeout(() => {
      setEditingStep(null);
      setIsStepModalOpen(true);
    }, 250);
  };

  const handleExport = () => {
    if (currentProject) {
      exportProjectToJson(currentProject);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const projectToDelete = projects.find((p) => p.id === projectId);
    if (!projectToDelete) return;

    if (!confirm(`Deseja realmente excluir o projeto "${projectToDelete.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const remainingProjects = projects.filter((p) => p.id !== projectId);
    setProjects(remainingProjects);

    if (remainingProjects.length === 0) {
      setCurrentId('');
      localStorage.removeItem('montatech_saved_projects_v1');
      localStorage.removeItem('montatech_current_project_id_v1');
    } else if (currentId === projectId) {
      setCurrentId(remainingProjects[0].id);
    }
  };

  const handleSaveProjectDetails = (updated: EquipmentProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setIsEditProjectModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Contract (3 zones) */}
      <Header
        currentProject={currentProject}
        projects={projects}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onOpenEditProjectModal={() => setIsEditProjectModalOpen(true)}
        onSelectProject={(id) => setCurrentId(id)}
        onExportProject={handleExport}
        onDeleteProject={handleDeleteProject}
      />

      {/* Main Content by ViewMode */}
      <main className="flex-1 pb-16">
        {!currentProject ? (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shadow-xl">
              <FolderArchive className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Nenhum Projeto Cadastrado
              </h2>
              <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                Você ainda não possui nenhum equipamento ou manual criado. Clique abaixo para iniciar o seu primeiro projeto de montagem.
              </p>
            </div>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-lg shadow-amber-950/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Criar Meu Primeiro Projeto</span>
            </button>
          </div>
        ) : viewMode === 'assembly' ? (
          <AssemblyMode
            project={currentProject}
            onExitToEditor={() => setViewMode('editor')}
            onOpenLightbox={handleOpenLightbox}
          />
        ) : viewMode === 'manual' ? (
          <ManualView
            project={currentProject}
            onBackToEditor={() => setViewMode('editor')}
            onOpenLightbox={handleOpenLightbox}
          />
        ) : (
          /* Editor Mode */
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
            {/* Project Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
              <div className="relative min-h-[380px] sm:min-h-[280px] w-full flex flex-col justify-end">
                <img
                  src={currentProject.coverImage}
                  alt={currentProject.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Contrast Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40" />

                {/* Banner Content */}
                <div className="relative z-10 p-4 sm:p-8 flex flex-col justify-end">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-neutral-400 mb-2">
                    <span className="text-amber-400 font-semibold">{currentProject.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Dificuldade: {currentProject.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">Tempo: {currentProject.estimatedHours}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{currentProject.steps.length} etapas</span>
                  </div>

                  <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {currentProject.name}
                  </h1>

                  {currentProject.subtitle && (
                    <p className="text-xs sm:text-base text-neutral-300 mt-1 max-w-3xl line-clamp-2">
                      {currentProject.subtitle}
                    </p>
                  )}

                  {/* Mobile-Optimized Actions in Hero */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 mt-4 sm:mt-5">
                    <button
                      onClick={() => setViewMode('assembly')}
                      disabled={currentProject.steps.length === 0}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-amber-950/20 min-h-[42px]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Iniciar Modo Montagem</span>
                    </button>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setIsEditProjectModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl transition-colors min-h-[40px]"
                        title="Editar dados e foto de capa do projeto"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Editar Projeto</span>
                      </button>

                      <button
                        onClick={() => setViewMode('manual')}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-950/80 hover:bg-neutral-900 border border-neutral-800 rounded-xl transition-colors min-h-[40px]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Manual / PDF</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteProject(currentProject.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 rounded-xl transition-colors sm:ml-auto min-h-[40px]"
                      title="Excluir este projeto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Projeto</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tools Strip below cover */}
              {currentProject.toolsRequired && currentProject.toolsRequired.length > 0 && (
                <div className="px-6 py-3 bg-neutral-950/80 border-t border-neutral-800 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold mr-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Ferramentas da Bancada:</span>
                  </div>
                  {currentProject.toolsRequired.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Steps Sequence Section */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-neutral-800">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Sequência de Montagem
                </h3>
                <p className="text-xs text-neutral-400">
                  Etapas ordenadas com foto principal, fotos adicionais, título, subtítulo e descrição técnica detalhada.
                </p>
              </div>

              {/* Steps List */}
              {currentProject.steps.length > 0 ? (
                <div className="space-y-4">
                  {currentProject.steps.map((step, index) => (
                    <StepCard
                      key={step.id}
                      step={step}
                      index={index}
                      totalSteps={currentProject.steps.length}
                      onEdit={() => {
                        setEditingStep(step);
                        setIsStepModalOpen(true);
                      }}
                      onDelete={() => handleDeleteStep(step.id)}
                      onMoveUp={() => handleMoveStep(index, 'up')}
                      onMoveDown={() => handleMoveStep(index, 'down')}
                      onOpenImage={handleOpenLightbox}
                    />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-16 px-4 bg-neutral-900/50 border border-dashed border-neutral-800 rounded-2xl">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
                    <Layers className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Nenhuma etapa na sequência ainda
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto mb-5 leading-relaxed">
                    Comece adicionando a primeira foto do processo de montagem. Para cada etapa, informe um título, subtítulo, foto principal, fotos adicionais e a descrição detalhada.
                  </p>
                  <button
                    onClick={() => {
                      setEditingStep(null);
                      setIsStepModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-lg shadow-amber-950/20"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Adicionar Primeira Etapa (Etapa #1)</span>
                  </button>
                </div>
              )}

              {/* Single Bottom Add Step Button */}
              {currentProject.steps.length > 0 && (
                <div className="pt-4 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setEditingStep(null);
                      setIsStepModalOpen(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-dashed border-amber-400/50 hover:border-amber-400 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-semibold transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Adicionar Próxima Etapa à Sequência (Etapa #{currentProject.steps.length + 1})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* New Project Modal (Create New Project) */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* Edit Project Details Modal (Return to edit project creation data) */}
      <NewProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
        onSaveProject={handleSaveProjectDetails}
        projectToEdit={currentProject}
      />

      {/* Step Modal (Title, Subtitle, Main Photo, Additional Photos, Detailed Description) */}
      <StepModal
        isOpen={isStepModalOpen}
        onClose={() => {
          setIsStepModalOpen(false);
          setEditingStep(null);
        }}
        onSaveStep={handleSaveStep}
        initialStep={editingStep}
        nextStepNumber={currentProject ? currentProject.steps.length + 1 : 1}
        allSteps={currentProject ? currentProject.steps : []}
        onNavigateStep={(step) => setEditingStep(step)}
      />

      {/* Image Lightbox / Full-screen Inspector */}
      <ImageLightbox
        isOpen={lightboxState.isOpen}
        onClose={handleCloseLightbox}
        imageUrl={lightboxState.imageUrl}
        title={lightboxState.title}
        caption={lightboxState.caption}
      />
    </div>
  );
}
