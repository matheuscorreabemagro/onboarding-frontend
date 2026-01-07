// Serviço de API para comunicação com o backend FastAPI

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = 'v1';
const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

export interface LayerResponse {
  id: number;
  name: string;
  description?: string;
  geometry_type: string;
  geometry: GeoJSON.Geometry;
  properties?: Record<string, unknown>;
  style?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  message: string;
  layers_created: number;
  layer_ids: number[];
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSON.Feature[];
}

class ApiService {
  // Listar todas as camadas
  async getLayers(skip = 0, limit = 100): Promise<{ total: number; items: LayerResponse[] }> {
    const response = await fetch(`${API_URL}/layers?skip=${skip}&limit=${limit}`);
    if (!response.ok) throw new Error('Falha ao buscar camadas');
    return response.json();
  }

  // Listar camadas como GeoJSON FeatureCollection
  async getLayersGeoJSON(skip = 0, limit = 100): Promise<FeatureCollection> {
    const response = await fetch(`${API_URL}/layers/geojson?skip=${skip}&limit=${limit}`);
    if (!response.ok) throw new Error('Falha ao buscar camadas');
    return response.json();
  }

  // Buscar camada específica
  async getLayer(layerId: number): Promise<LayerResponse> {
    const response = await fetch(`${API_URL}/layers/${layerId}`);
    if (!response.ok) throw new Error('Camada não encontrada');
    return response.json();
  }

  // Buscar camada como GeoJSON
  async getLayerGeoJSON(layerId: number): Promise<GeoJSON.Feature> {
    const response = await fetch(`${API_URL}/layers/${layerId}/geojson`);
    if (!response.ok) throw new Error('Camada não encontrada');
    return response.json();
  }

  // Criar nova camada
  async createLayer(layerData: {
    name: string;
    description?: string;
    geometry: GeoJSON.Geometry;
    properties?: Record<string, unknown>;
    style?: Record<string, unknown>;
  }): Promise<LayerResponse> {
    const response = await fetch(`${API_URL}/layers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(layerData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Falha ao criar camada');
    }
    return response.json();
  }

  // Atualizar camada
  async updateLayer(
    layerId: number,
    updates: {
      name?: string;
      description?: string;
      geometry?: GeoJSON.Geometry;
      properties?: Record<string, unknown>;
      style?: Record<string, unknown>;
    }
  ): Promise<LayerResponse> {
    const response = await fetch(`${API_URL}/layers/${layerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Falha ao atualizar camada');
    }
    return response.json();
  }

  // Deletar camada
  async deleteLayer(layerId: number): Promise<void> {
    const response = await fetch(`${API_URL}/layers/${layerId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Falha ao deletar camada');
  }

  // Deletar múltiplas camadas em lote
  async deleteLayers(layerIds: number[]): Promise<{
    deleted_count: number;
    total_requested: number;
    failed_ids: number[];
  }> {
    const response = await fetch(`${API_URL}/layers/batch/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(layerIds),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Falha ao deletar camadas');
    }
    return response.json();
  }

  // Upload de arquivo (GeoJSON, KML, Shapefile)
  async uploadFile(file: File, layerName: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_URL}/layers/upload?layer_name=${encodeURIComponent(layerName)}`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Falha ao fazer upload');
    }
    return response.json();
  }

  // Exportar camada
  async exportLayer(layerId: number, format: 'geojson' | 'kml' | 'shapefile'): Promise<void> {
    const response = await fetch(`${API_URL}/layers/${layerId}/export/${format}`);
    if (!response.ok) throw new Error('Falha ao exportar camada');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layer_${layerId}.${format === 'shapefile' ? 'zip' : format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Exportar camada em múltiplos formatos (batch)
  async exportLayerBatch(layerId: number, formats: string[]): Promise<void> {
    const response = await fetch(`${API_URL}/layers/${layerId}/export/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formats),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Falha ao exportar camada');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layer_${layerId}_export.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Exportar todas as camadas
  async exportAllLayers(format: 'geojson' | 'kml' | 'shapefile'): Promise<void> {
    const response = await fetch(`${API_URL}/layers/export/all/${format}`);
    if (!response.ok) throw new Error('Falha ao exportar camadas');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_layers.${format === 'shapefile' ? 'zip' : format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; environment: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Backend não está respondendo');
    return response.json();
  }
}

export const api = new ApiService();
