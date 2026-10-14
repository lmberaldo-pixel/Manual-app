import { EquipmentProject } from '../types';

export const STORAGE_PROJECTS_KEY = 'montatech_saved_projects_v1';
export const STORAGE_CURRENT_ID_KEY = 'montatech_current_project_id_v1';

/**
 * Validates and sanitizes a raw parsed project object to ensure it has all
 * required fields. Fills in safe defaults for any missing optional fields.
 */
function sanitizeProject(raw: any): EquipmentProject | null {
  if (!raw || typeof raw !== 'object' || !raw.id || !raw.name) return null;

  return {
    id: String(raw.id),
    name: String(raw.name),
    subtitle: raw.subtitle ? String(raw.subtitle) : undefined,
    coverImage: raw.coverImage ? String(raw.coverImage) : '',
    category: raw.category ? String(raw.category) : 'Geral',
    difficulty: (['Iniciante', 'Intermediário', 'Avançado', 'Especialista'].includes(raw.difficulty)
      ? raw.difficulty
      : 'Intermediário') as EquipmentProject['difficulty'],
    estimatedHours: raw.estimatedHours ? String(raw.estimatedHours) : '1h',
    generalDescription: raw.generalDescription ? String(raw.generalDescription) : '',
    toolsRequired: Array.isArray(raw.toolsRequired)
      ? raw.toolsRequired.map(String)
      : [],
    steps: Array.isArray(raw.steps) ? raw.steps : [],
    createdAt: raw.createdAt ? String(raw.createdAt) : new Date().toISOString(),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : new Date().toISOString(),
  };
}

export function loadAllProjects(): EquipmentProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Sanitize every project to avoid crashes from corrupted or old-format data
    const projects: EquipmentProject[] = [];
    for (const item of parsed) {
      const sanitized = sanitizeProject(item);
      if (sanitized) projects.push(sanitized);
    }
    return projects;
  } catch (err) {
    console.error('Error loading projects from storage:', err);
    return [];
  }
}

/**
 * Saves all projects to localStorage.
 * Returns { ok: true } on success.
 * Returns { ok: false, quotaExceeded: true } if storage is full so the
 * caller can show a non-blocking toast instead of a blocking alert.
 */
export function saveAllProjects(
  projects: EquipmentProject[]
): { ok: boolean; quotaExceeded?: boolean } {
  try {
    const serialized = JSON.stringify(projects);
    localStorage.setItem(STORAGE_PROJECTS_KEY, serialized);
    return { ok: true };
  } catch (err: any) {
    const isQuotaError =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22;

    if (isQuotaError) {
      console.error('Storage quota exceeded. Projects could not be saved.', err);
      return { ok: false, quotaExceeded: true };
    }
    console.error('Error saving projects to storage:', err);
    return { ok: false };
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
 * Removes all MontaTech data from localStorage cleanly using the same
 * key constants, avoiding any hard-coded string duplication.
 */
export function clearAllStorage(): void {
  try {
    localStorage.removeItem(STORAGE_PROJECTS_KEY);
    localStorage.removeItem(STORAGE_CURRENT_ID_KEY);
  } catch (err) {
    console.error('Error clearing storage:', err);
  }
}

/**
 * Compresses an image file to an optimised base64 JPEG for localStorage.
 *
 * Mobile cameras produce 4000-8000px images that, even after one
 * compression pass, can easily exceed localStorage quota (~5 MB on mobile).
 * This function detects oversized images and applies a tighter budget:
 *   – Images wider than 1280px → cap at 900px (mobile) at 0.72 quality
 *   – Images wider than 800px  → cap at 1280px at 0.82 quality (desktop)
 *   – Smaller images          → keep original size at 0.88 quality
 *
 * Result size target: ≤ 150 KB per image so that 30+ steps can fit safely.
 */
export async function fileToOptimizedDataUrl(
  file: File,
  _maxWidth?: number, // kept for API compatibility, now auto-chosen
  _quality?: number   // kept for API compatibility, now auto-chosen
): Promise<string> {
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

        // Choose compression aggressiveness based on source image size
        let targetWidth: number;
        let quality: number;

        if (width > 2000 || height > 2000) {
          // Typical mobile camera photo — aggressive compression
          targetWidth = 900;
          quality = 0.72;
        } else if (width > 1280) {
          // Large desktop/tablet image
          targetWidth = 1280;
          quality = 0.82;
        } else {
          // Already small enough — light compression only
          targetWidth = width;
          quality = 0.88;
        }

        if (width > targetWidth) {
          height = Math.round((height * targetWidth) / width);
          width = targetWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback: return original data URL without canvas compression
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

        // Sanitize and assign a fresh id to avoid collision, preserve original name
        const sanitized = sanitizeProject({ ...parsed, id: `project-${Date.now()}` });
        if (!sanitized) {
          reject(new Error('Projeto importado não pôde ser validado.'));
          return;
        }
        resolve(sanitized);
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
