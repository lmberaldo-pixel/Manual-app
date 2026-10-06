import React from 'react';
import { ViewMode, EquipmentProject } from '../types';
import { Plus, Play, PenTool, FileText, Download, FolderArchive, Trash2 } from 'lucide-react';

interface HeaderProps {
  currentProject: EquipmentProject;
  projects: EquipmentProject[];
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onOpenNewProjectModal: () => void;
  onOpenEditProjectModal: () => void;
  onSelectProject: (projectId: string) => void;
  onExportProject: () => void;
  onDeleteProject: (projectId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  viewMode,
  onSelectViewMode,
  onOpenNewProjectModal,
  onOpenEditProjectModal,
  onSelectProject,
  onExportProject,
  onDeleteProject,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectViewMode('editor');
          }}
          className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap"
        >
          MontaTech
        </a>

        {/* Project Switcher Select */}
        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-neutral-800 text-xs text-neutral-400">
          <FolderArchive className="w-3.5 h-3.5 text-neutral-500" />
          <select
            value={currentProject.id}
            onChange={(e) => onSelectProject(e.target.value)}
            className="bg-neutral-800/80 border border-neutral-700/80 text-neutral-200 text-xs rounded-md px-2 py-1 max-w-[200px] truncate focus:outline-none focus:ring-1 focus:ring-amber-500"
            title="Alternar Projeto"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onDeleteProject(currentProject.id)}
            title={`Excluir projeto "${currentProject.name}"`}
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zone 2: Navigation Links / Segmented Mode Selector */}
      <nav className="flex items-center gap-1 p-1 bg-neutral-950/60 rounded-lg border border-neutral-800/80">
        <button
          onClick={() => onSelectViewMode('editor')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            viewMode === 'editor'
              ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <PenTool className="w-3.5 h-3.5 text-amber-400" />
          <span>Editor de Etapas</span>
        </button>

        <button
          onClick={() => onSelectViewMode('assembly')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            viewMode === 'assembly'
              ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Modo Montagem</span>
        </button>

        <button
          onClick={() => onSelectViewMode('manual')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            viewMode === 'manual'
              ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-neutral-400" />
          <span>Manual Técnico</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenEditProjectModal}
          title="Editar dados e capa deste projeto"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg transition-colors whitespace-nowrap"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Editar Projeto</span>
        </button>

        <button
          onClick={onExportProject}
          title="Baixar backup JSON deste projeto"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800/80 border border-neutral-700/80 rounded-lg hover:bg-neutral-700/80 hover:text-white transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar</span>
        </button>

        <button
          onClick={onOpenNewProjectModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-950/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Novo Projeto</span>
        </button>
      </div>
    </header>
  );
};
