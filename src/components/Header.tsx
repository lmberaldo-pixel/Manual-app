import React, { useRef } from 'react';
import { ViewMode, EquipmentProject } from '../types';
import { Plus, Play, PenTool, FileText, Download, Upload, FolderArchive, Trash2 } from 'lucide-react';

interface HeaderProps {
  currentProject: EquipmentProject | null;
  projects: EquipmentProject[];
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onOpenNewProjectModal: () => void;
  onOpenEditProjectModal: () => void;
  onSelectProject: (projectId: string) => void;
  onExportProject: () => void;
  onImportProject: (file: File) => void;
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
  onImportProject,
  onDeleteProject,
}) => {
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportProject(file);
      e.target.value = ''; // reset so same file can be re-imported
    }
  };
  return (
    <header className="no-print sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Top Row on Mobile: Logo, Selector & Primary Actions */}
        <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
          {/* Logo & Project Switcher */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectViewMode('editor');
              }}
              className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap flex-shrink-0"
            >
              MontaTech
            </a>

            {projects.length > 0 && currentProject && (
              <div className="flex items-center gap-1 pl-2 sm:pl-3 border-l border-neutral-800 text-xs text-neutral-400 flex-1 min-w-0">
                <FolderArchive className="w-3.5 h-3.5 text-neutral-500 hidden sm:block flex-shrink-0" />
                <select
                  value={currentProject.id}
                  onChange={(e) => onSelectProject(e.target.value)}
                  className="bg-neutral-800/80 border border-neutral-700/80 text-neutral-200 text-xs rounded-md px-1.5 py-1 w-full max-w-[120px] xs:max-w-[150px] sm:max-w-[200px] truncate focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                  className="hidden sm:block p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-md transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Actions: Import, Export & + Novo */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Hidden file input for import */}
            <input
              ref={importFileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFileChange}
            />

            <button
              onClick={() => importFileRef.current?.click()}
              title="Importar projeto de um arquivo JSON de backup"
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Importar</span>
            </button>

            <button
              onClick={onExportProject}
              disabled={!currentProject}
              title="Exportar backup JSON deste projeto"
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Exportar</span>
            </button>

            <button
              onClick={onOpenEditProjectModal}
              disabled={!currentProject}
              title="Editar dados do projeto"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 disabled:opacity-40 border border-amber-400/30 rounded-lg transition-colors"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              onClick={onOpenNewProjectModal}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-950/20 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Novo</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <nav className="flex items-center justify-center sm:justify-start gap-1 p-0.5 sm:p-1 bg-neutral-950/80 rounded-lg border border-neutral-800 w-full sm:w-auto">
          <button
            onClick={() => onSelectViewMode('editor')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'editor'
                ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>Editor</span>
          </button>

          <button
            onClick={() => onSelectViewMode('assembly')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'assembly'
                ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Montagem</span>
          </button>

          <button
            onClick={() => onSelectViewMode('manual')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'manual'
                ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            <span>Manual</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
