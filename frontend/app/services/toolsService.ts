import type { Feature } from '../types';
import { isLineGeometry, isPolygonGeometry } from '../utils/turfOperations';

/**
 * Service para lógica de ferramentas
 * Extrai validações de ferramentas do componente Toolbar (Single Responsibility)
 */

export type ToolMode = 'draw' | 'snap' | 'split' | 'offset' | 'simplify' | 'delete' | null;

export interface ToolValidation {
  canSplit: boolean;
  canOffset: boolean;
  canSimplify: boolean;
  canDelete: boolean;
}

/**
 * Verifica quais ferramentas podem ser usadas com a feature selecionada
 */
export function getToolValidation(selectedFeature: Feature | undefined): ToolValidation {
  if (!selectedFeature) {
    return {
      canSplit: false,
      canOffset: false,
      canSimplify: false,
      canDelete: false,
    };
  }

  const isLine = isLineGeometry(selectedFeature);
  const isPolygon = isPolygonGeometry(selectedFeature);

  return {
    canSplit: isLine,
    canOffset: isLine,
    canSimplify: isLine || isPolygon,
    canDelete: true, // Pode deletar qualquer feature
  };
}

/**
 * Verifica se uma ferramenta específica pode ser usada
 */
export function canUseTool(tool: ToolMode, selectedFeature: Feature | undefined): boolean {
  if (!tool || tool === 'draw' || tool === 'snap') {
    return true; // Essas ferramentas não dependem de feature selecionada
  }

  const validation = getToolValidation(selectedFeature);

  switch (tool) {
    case 'split':
      return validation.canSplit;
    case 'offset':
      return validation.canOffset;
    case 'simplify':
      return validation.canSimplify;
    case 'delete':
      return validation.canDelete;
    default:
      return false;
  }
}

/**
 * Retorna lista de ferramentas disponíveis baseado na feature selecionada
 */
export function getAvailableTools(selectedFeature: Feature | undefined): ToolMode[] {
  const tools: ToolMode[] = ['draw', 'snap'];
  const validation = getToolValidation(selectedFeature);

  if (validation.canSplit) tools.push('split');
  if (validation.canOffset) tools.push('offset');
  if (validation.canSimplify) tools.push('simplify');
  if (validation.canDelete) tools.push('delete');

  return tools;
}
