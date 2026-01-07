from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.database import Base


class Layer(Base):
    """
    Model para camadas geoespaciais.
    
    Armazena geometrias utilizando o PostGIS através do GeoAlchemy2.
    Suporta diferentes tipos de geometrias (Point, LineString, Polygon, etc.)
    """
    
    __tablename__ = "layers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Tipo de geometria: Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection
    geometry_type = Column(String(50), nullable=False)
    
    # Número de features (1 para geometria única, N para FeatureCollection)
    feature_count = Column(Integer, default=1, nullable=False)
    
    # GeoJSON completo (para FeatureCollections com múltiplas features)
    # Se feature_count > 1, este campo contém o FeatureCollection completo
    geojson = Column(Text, nullable=True)
    
    # Geometria armazenada usando PostGIS
    # SRID 4326 = WGS84 (padrão do GPS e GeoJSON)
    geometry = Column(
        Geometry(geometry_type='GEOMETRY', srid=4326, spatial_index=True),
        nullable=False
    )
    
    # Propriedades adicionais em formato JSON (opcional)
    properties = Column(Text, nullable=True)
    
    # Estilo visual (cores, espessura, etc.) em formato JSON
    style = Column(Text, nullable=True)
    
    # Timestamps automáticos
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Layer(id={self.id}, name='{self.name}', type='{self.geometry_type}')>"
