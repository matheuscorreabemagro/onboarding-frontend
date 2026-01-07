from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime


class LayerBase(BaseModel):
    """Schema base para Layer."""
    name: str = Field(..., min_length=1, max_length=255, description="Nome da camada")
    description: Optional[str] = Field(None, description="Descrição da camada")
    properties: Optional[Dict[str, Any]] = Field(None, description="Propriedades adicionais em formato JSON")
    style: Optional[Dict[str, Any]] = Field(None, description="Estilo visual da camada")


class LayerCreate(LayerBase):
    """Schema para criação de Layer."""
    geometry: Dict[str, Any] = Field(..., description="Geometria em formato GeoJSON")
    
    @field_validator('geometry')
    @classmethod
    def validate_geometry(cls, v):
        """Valida se a geometria possui os campos obrigatórios."""
        if not isinstance(v, dict):
            raise ValueError("Geometria deve ser um objeto JSON")
        
        if 'type' not in v:
            raise ValueError("Geometria deve conter o campo 'type'")
        
        valid_types = [
            'Point', 'LineString', 'Polygon',
            'MultiPoint', 'MultiLineString', 'MultiPolygon',
            'GeometryCollection'
        ]
        
        if v['type'] not in valid_types:
            raise ValueError(f"Tipo de geometria inválido. Tipos válidos: {valid_types}")
        
        if 'coordinates' not in v and v['type'] != 'GeometryCollection':
            raise ValueError("Geometria deve conter o campo 'coordinates'")
        
        return v


class LayerUpdate(BaseModel):
    """Schema para atualização de Layer."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    geometry: Optional[Dict[str, Any]] = None
    properties: Optional[Dict[str, Any]] = None
    style: Optional[Dict[str, Any]] = None


class LayerResponse(LayerBase):
    """Schema de resposta para Layer."""
    id: int
    geometry_type: str
    geometry: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Pydantic v2 (antes era orm_mode = True)


class LayerGeoJSON(BaseModel):
    """Schema para resposta em formato GeoJSON."""
    type: str = "Feature"
    id: int
    geometry: Dict[str, Any]
    properties: Dict[str, Any]
    
    class Config:
        from_attributes = True


class LayerListResponse(BaseModel):
    """Schema para lista de camadas."""
    total: int
    items: list[LayerResponse]


class FeatureCollectionResponse(BaseModel):
    """Schema para FeatureCollection GeoJSON."""
    type: str = "FeatureCollection"
    features: list[LayerGeoJSON]


class UploadResponse(BaseModel):
    """Schema para resposta de upload."""
    message: str
    layers_created: int
    layer_ids: list[int]
