import type { Feature } from './index';

/**
 * Representa uma camada de edição geoespacial
 */
export interface Layer {
  /** Identificador único da camada */
  id: string;
  
  /** Nome exibido para o usuário */
  name: string;
  
  /** Features GeoJSON desta camada */
  features: Feature[];
  
  /** Se true, esta camada pode ser editada */
  isActive: boolean;
  
  /** Se true, camada está visível no mapa */
  isVisible: boolean;
  
  /** Cor de destaque da camada (hex) */
  color: string;
  
  /** Opacidade da camada (0-1) */
  opacity: number;
  
  /** Ordem de renderização (maior = mais acima) */
  zIndex: number;
  
  /** Data de criação */
  createdAt: Date;
}

/**
 * Estado de camadas no store
 */
export interface LayerState {
  layers: Layer[];
  activeLayerId: string | null;
}
