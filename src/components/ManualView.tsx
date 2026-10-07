import React from 'react';
import { EquipmentProject } from '../types';
import { Printer, Download, ArrowLeft, Wrench, Clock, AlertTriangle, Lightbulb } from 'lucide-react';

interface ManualViewProps {
  project: EquipmentProject;
  onBackToEditor: () => void;
  onOpenLightbox: (url: string, title: string, caption?: string) => void;
}

export const ManualView: React.FC<ManualViewProps> = ({
  project,
  onBackToEditor,
  onOpenLightbox,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-12 py-8 space-y-8 print:max-w-none print:p-0 print:m-0 print:space-y-0 print:bg-white">
      {/* Action Header for Screen (Hidden when printing) */}
      <div className="no-print flex items-center justify-between p-4 bg-neutral-900/90 rounded-xl shadow-md">
        <button
          onClick={onBackToEditor}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Editor</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar em PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Technical Manual Document */}
      <article className="bg-neutral-900/90 rounded-2xl p-8 sm:p-12 text-neutral-100 print:bg-white print:text-black print:p-0 print:m-0 print:rounded-none print:shadow-none">
        {/* Cover Section */}
        <header className="pb-8 mb-8 print:pb-4 print:mb-0 print-page-break-after">
          {/* Running Document Header */}
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-800/60 print:border-neutral-300 text-xs font-mono">
            <span className="text-amber-400 print:text-neutral-900 font-bold uppercase tracking-wider">
              Projeto: {project.name}
            </span>
            <span className="text-neutral-400 print:text-neutral-600">
              Manual Técnico de Montagem
            </span>
          </div>

          <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden mb-6 bg-neutral-950">
            <img
              src={project.coverImage}
              alt={project.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain bg-neutral-950"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 print:text-amber-800">
              Manual Técnico de Montagem Sequencial
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white print:text-neutral-900">
              {project.name}
            </h1>
            {project.subtitle && (
              <p className="text-lg font-medium text-neutral-300 print:text-neutral-700">
                {project.subtitle}
              </p>
            )}
          </div>

          {/* Metadata Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-800/60 print:border-neutral-200 text-xs">
            <div>
              <span className="block text-neutral-400 print:text-neutral-600">Categoria</span>
              <span className="font-semibold text-white print:text-black">{project.category}</span>
            </div>
            <div>
              <span className="block text-neutral-400 print:text-neutral-600">Dificuldade</span>
              <span className="font-semibold text-white print:text-black">{project.difficulty}</span>
            </div>
            <div>
              <span className="block text-neutral-400 print:text-neutral-600">Tempo Estimado</span>
              <span className="font-semibold text-white print:text-black font-mono">{project.estimatedHours}</span>
            </div>
            <div>
              <span className="block text-neutral-400 print:text-neutral-600">Total de Etapas</span>
              <span className="font-semibold text-white print:text-black font-mono">{project.steps.length} passos</span>
            </div>
          </div>

          {/* Tools Required Section */}
          {project.toolsRequired && project.toolsRequired.length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-neutral-950/80 print:bg-neutral-50">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 print:text-amber-800 mb-2">
                <Wrench className="w-3.5 h-3.5" />
                Ferramentas & Equipamentos Necessários
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-neutral-300 print:text-neutral-800">
                {project.toolsRequired.map((tool, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-amber-400 print:text-amber-700">▪</span>
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* Sequential Steps List */}
        <section className="space-y-12 print:space-y-0">
          {project.steps.map((step, idx) => (
            <div
              key={step.id}
              className="pt-6 border-t border-neutral-800/60 print:border-none print:pt-2 print:pb-4 print-page-break"
            >
              {/* Header de Página com Nome do Projeto */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800/60 print:border-neutral-300 text-xs font-mono">
                <span className="text-amber-400 print:text-neutral-900 font-bold uppercase tracking-wider">
                  Projeto: {project.name}
                </span>
                <span className="text-neutral-400 print:text-neutral-600 font-medium">
                  Manual Técnico • Passo #{step.stepNumber} de {project.steps.length}
                </span>
              </div>

              {/* Step Header */}
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 font-bold text-sm font-mono print:bg-neutral-800 print:text-white">
                  #{step.stepNumber}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white print:text-neutral-900 tracking-tight">
                    {step.title}
                  </h2>
                  <p className="text-sm font-medium text-amber-400 print:text-amber-800 mt-0.5">
                    {step.subtitle}
                  </p>
                </div>
              </div>

              {/* Main Photo & Additional Photos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Main Photo (2 cols on md) */}
                <div className="md:col-span-2">
                  <div
                    onClick={() => onOpenLightbox(step.mainImage, step.title, step.subtitle)}
                    className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 cursor-pointer group"
                  >
                    <img
                      src={step.mainImage}
                      alt={step.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain bg-neutral-950 print:bg-white group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="no-print absolute top-3 left-3 px-2 py-0.5 rounded bg-neutral-950/80 text-[10px] text-white font-mono">
                      Foto Principal
                    </div>
                  </div>
                </div>

                {/* Additional Photos Column (1 col on md) */}
                {step.additionalImages && step.additionalImages.length > 0 && (
                  <div className="space-y-3">
                    {step.additionalImages.map((extra, eIdx) => (
                      <div
                        key={extra.id || eIdx}
                        onClick={() =>
                          onOpenLightbox(
                            extra.url,
                            `${step.title} - Detalhe ${eIdx + 1}`,
                            extra.caption
                          )
                        }
                        className="relative aspect-video rounded-lg overflow-hidden bg-neutral-950 cursor-pointer group"
                      >
                        <img
                          src={extra.url}
                          alt={extra.caption || 'Foto extra'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain bg-neutral-950 print:bg-white group-hover:scale-105 transition-transform"
                        />
                        {extra.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-neutral-950/80 p-1 text-[10px] text-neutral-300 truncate">
                            {extra.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step Detailed Description */}
              <div className="p-4 rounded-xl bg-neutral-950/60 print:bg-neutral-50 text-sm text-neutral-200 print:text-neutral-800 leading-relaxed whitespace-pre-line mb-3">
                {step.description}
              </div>

              {/* Tools & Callouts */}
              <div className="space-y-2 text-xs">
                {step.tools && step.tools.length > 0 && (
                  <p className="text-neutral-400 print:text-neutral-600">
                    <strong className="text-neutral-200 print:text-black">Ferramentas:</strong>{' '}
                    {step.tools.join(', ')}
                  </p>
                )}

                {step.warning && (
                  <div className="p-3 rounded-lg bg-amber-950/20 print:bg-amber-50 text-amber-200 print:text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 print:text-amber-700 flex-shrink-0 mt-0.5" />
                    <span><strong>Atenção:</strong> {step.warning}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </article>
    </div>
  );
};
