import { EquipmentProject } from '../types';

const STORAGE_PROJECTS_KEY = 'montatech_saved_projects_v1';
const STORAGE_CURRENT_ID_KEY = 'montatech_current_project_id_v1';

export function loadAllProjects(): EquipmentProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Error loading projects from storage:', err);
    return [];
  }
}

export function saveAllProjects(projects: EquipmentProject[]): void {
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects to storage:', err);
  }
}

export function getCurrentProjectId(): string {
  try {
    const currentId = localStorage.getItem(STORAGE_CURRENT_ID_KEY);
    return currentId || '';
  } catch {
    return '';
  }
}

export function setCurrentProjectId(id: string): void {
  try {
    localStorage.setItem(STORAGE_CURRENT_ID_KEY, id);
  } catch (err) {
    console.error('Error setting current project id:', err);
  }
}

/**
 * Compresses an image file (e.g. from camera or upload) to max 1280px width
 * so base64 stays lightweight and responsive in localStorage.
 */
export async function fileToOptimizedDataUrl(file: File, maxWidth = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Export project as downloadable JSON file
 */
export function exportProjectToJson(project: EquipmentProject): void {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const sanitizedName = project.name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  a.download = `manual_montagem_${sanitizedName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import a project from a JSON backup file selected by the user.
 * Resolves with the parsed EquipmentProject or rejects on error.
 */
export function importProjectFromJson(file: File): Promise<EquipmentProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        // Basic validation: must have at least id and name
        if (!parsed || typeof parsed !== 'object' || !parsed.name) {
          reject(new Error('Arquivo JSON inválido ou não é um projeto MontaTech.'));
          return;
        }
        // Assign a fresh id to avoid collision, preserve original name
        const project: EquipmentProject = {
          ...parsed,
          id: `project-${Date.now()}`,
          importedAt: new Date().toISOString(),
        };
        resolve(project);
      } catch {
        reject(new Error('Arquivo não é um JSON válido.'));
      }
    };
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Curated preset images for fast testing if user does not upload immediately
 */
export const PRESET_EQUIPMENT_IMAGES = [
  {
    name: 'Impressora 3D',
    url: '/src/assets/images/cover_equipment_3dprinter_1790907056807.jpg',
  },
  {
    name: 'Chassi & Estrutura',
    url: '/src/assets/images/step1_frame_assembly_1790907066457.jpg',
  },
  {
    name: 'Motores & Transmissão',
    url: '/src/assets/images/step2_stepper_motor_1790907076976.jpg',
  },
  {
    name: 'Cabeamento & Extrusor',
    url: '/src/assets/images/step3_wiring_extruder_1790907087392.jpg',
  }
];
