export interface StepImage {
  id: string;
  url: string;
  caption?: string;
}

export interface CheckpointItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AssemblyStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  mainImage: string;
  additionalImages: StepImage[];
  description: string;
  tools?: string[];
  warning?: string;
  tip?: string;
  checkpoints?: CheckpointItem[];
  estimatedMinutes?: number;
}

export interface EquipmentProject {
  id: string;
  name: string;
  subtitle?: string;
  coverImage: string;
  category: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Especialista';
  estimatedHours: string;
  generalDescription: string;
  toolsRequired: string[];
  steps: AssemblyStep[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'editor' | 'assembly' | 'manual';
