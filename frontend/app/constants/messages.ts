// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  // Validação
  INVALID_JSON: 'Erro ao processar arquivo: JSON inválido.',
  INVALID_GEOJSON: 'Arquivo não é um GeoJSON válido.',
  INVALID_FILE: 'Erro ao ler arquivo. Verifique se o arquivo está correto.',
  
  // Layer
  LAYER_NO_GEOMETRIES: 'Camada não possui geometrias para salvar',
  LAYER_SAVE_ERROR: 'Erro ao salvar camada',
  LAYER_LOAD_ERROR: 'Erro ao carregar camadas',
  LAYER_DELETE_ERROR: 'Erro ao excluir camadas',
  LAYER_EXPORT_ERROR: 'Salve a camada antes de exportar',
  
  // Upload
  MULTIPLE_FILES: 'Apenas um arquivo por vez. Selecione apenas um arquivo GeoJSON.',
  UPLOAD_ERROR: 'Erro ao fazer upload',
  
  // Export
  EXPORT_NO_FORMAT: 'Selecione pelo menos um formato',
  EXPORT_ERROR: 'Erro ao exportar',
  
  // Generic
  UNKNOWN_ERROR: 'Ocorreu um erro inesperado',
} as const;

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  LAYER_SAVED: 'Geometria salva com sucesso!',
  LAYER_SAVED_MULTIPLE: (count: number) => `${count} geometrias salvas com sucesso!`,
  LAYER_DELETED: (count: number) => `${count} camada(s) excluída(s) com sucesso`,
  EXPORT_SUCCESS: 'Arquivo exportado com sucesso!',
  EXPORT_SUCCESS_MULTIPLE: (count: number) => `${count} formatos exportados com sucesso!`,
} as const;
