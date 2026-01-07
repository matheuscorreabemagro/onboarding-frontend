from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2.shape import to_shape, from_shape
from geoalchemy2.elements import WKBElement
from shapely.geometry import shape, mapping
from app.models.layer import Layer
from app.schemas.layer import LayerCreate, LayerUpdate
from typing import List, Optional
import json
import logging

logger = logging.getLogger(__name__)


class LayerService:
    """Service para operações CRUD de camadas geoespaciais."""
    
    @staticmethod
    def create_layer(db: Session, layer_data: LayerCreate) -> Layer:
        """
        Cria uma nova camada no banco de dados.
        Suporta tanto geometrias únicas quanto FeatureCollections com múltiplas geometrias.
        
        Args:
            db: Sessão do banco de dados
            layer_data: Dados da camada a ser criada
            
        Returns:
            Layer: Camada criada
        """
        try:
            # Converter geometria GeoJSON para Shapely geometry
            geom_dict = layer_data.geometry
            shapely_geom = shape(geom_dict)
            
            # Criar WKBElement para o PostGIS
            wkb_geometry = from_shape(shapely_geom, srid=4326)
            
            # Verificar se há informação de FeatureCollection (múltiplas geometrias)
            feature_count = 1
            geojson_data = None
            properties_to_save = layer_data.properties
            
            # Se properties contém 'features', é uma FeatureCollection
            if layer_data.properties and isinstance(layer_data.properties, dict):
                features = layer_data.properties.get('features')
                if features and isinstance(features, list):
                    feature_count = len(features)
                    # Criar FeatureCollection completa para armazenar
                    geojson_data = json.dumps({
                        'type': 'FeatureCollection',
                        'features': features
                    })
                    # Limpar properties para não duplicar dados
                    properties_to_save = None
                    logger.info(f"FeatureCollection detectada com {feature_count} geometrias")
            
            # Criar objeto Layer
            db_layer = Layer(
                name=layer_data.name,
                description=layer_data.description,
                geometry_type=geom_dict['type'],
                geometry=wkb_geometry,
                properties=json.dumps(properties_to_save) if properties_to_save else None,
                style=json.dumps(layer_data.style) if layer_data.style else None,
                feature_count=feature_count,
                geojson=geojson_data
            )
            
            db.add(db_layer)
            db.commit()
            db.refresh(db_layer)
            
            logger.info(f"Camada criada: {db_layer.id} - {db_layer.name} ({feature_count} geometria(s))")
            return db_layer
            
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao criar camada: {str(e)}")
            raise
    
    @staticmethod
    def get_layer(db: Session, layer_id: int) -> Optional[Layer]:
        """
        Busca uma camada por ID.
        
        Args:
            db: Sessão do banco de dados
            layer_id: ID da camada
            
        Returns:
            Layer ou None
        """
        return db.query(Layer).filter(Layer.id == layer_id).first()
    
    @staticmethod
    def get_layers(db: Session, skip: int = 0, limit: int = 100) -> List[Layer]:
        """
        Lista todas as camadas com paginação.
        
        Args:
            db: Sessão do banco de dados
            skip: Número de registros a pular
            limit: Número máximo de registros a retornar
            
        Returns:
            Lista de camadas
        """
        return db.query(Layer).offset(skip).limit(limit).all()
    
    @staticmethod
    def count_layers(db: Session) -> int:
        """
        Conta o total de camadas.
        
        Args:
            db: Sessão do banco de dados
            
        Returns:
            Número total de camadas
        """
        return db.query(func.count(Layer.id)).scalar()
    
    @staticmethod
    def update_layer(db: Session, layer_id: int, layer_update: LayerUpdate) -> Optional[Layer]:
        """
        Atualiza uma camada existente.
        
        Args:
            db: Sessão do banco de dados
            layer_id: ID da camada
            layer_update: Dados para atualização
            
        Returns:
            Layer atualizada ou None
        """
        try:
            db_layer = LayerService.get_layer(db, layer_id)
            if not db_layer:
                return None
            
            # Atualizar campos fornecidos
            update_data = layer_update.model_dump(exclude_unset=True)
            
            for field, value in update_data.items():
                if field == "geometry" and value is not None:
                    # Converter geometria
                    shapely_geom = shape(value)
                    wkb_geometry = from_shape(shapely_geom, srid=4326)
                    setattr(db_layer, field, wkb_geometry)
                    setattr(db_layer, "geometry_type", value['type'])
                elif field in ["properties", "style"] and value is not None:
                    setattr(db_layer, field, json.dumps(value))
                else:
                    setattr(db_layer, field, value)
            
            db.commit()
            db.refresh(db_layer)
            
            logger.info(f"Camada atualizada: {db_layer.id}")
            return db_layer
            
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao atualizar camada: {str(e)}")
            raise
    
    @staticmethod
    def delete_layer(db: Session, layer_id: int) -> bool:
        """
        Deleta uma camada.
        
        Args:
            db: Sessão do banco de dados
            layer_id: ID da camada
            
        Returns:
            True se deletado com sucesso, False caso contrário
        """
        try:
            db_layer = LayerService.get_layer(db, layer_id)
            if not db_layer:
                return False
            
            db.delete(db_layer)
            db.commit()
            
            logger.info(f"Camada deletada: {layer_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao deletar camada: {str(e)}")
            raise
    
    @staticmethod
    def layer_to_geojson(layer: Layer) -> dict:
        """
        Converte uma camada para formato GeoJSON.
        Se a camada contém uma FeatureCollection, retorna ela.
        
        Args:
            layer: Camada a ser convertida
            
        Returns:
            Dict no formato GeoJSON (Feature ou FeatureCollection)
        """
        # Se tem geojson armazenado (FeatureCollection), retornar ele
        if layer.geojson and layer.feature_count > 1:
            feature_collection = json.loads(layer.geojson)
            
            # Garantir que properties e geometry de cada feature estejam corretos
            for idx, feature in enumerate(feature_collection.get('features', [])):
                # Verificar properties
                props = feature.get('properties')
                if props is None:
                    feature['properties'] = {}
                elif isinstance(props, str):
                    try:
                        feature['properties'] = json.loads(props)
                    except (json.JSONDecodeError, TypeError):
                        feature['properties'] = {}
                elif not isinstance(props, dict):
                    feature['properties'] = {}
                
                # Verificar geometry
                geom = feature.get('geometry')
                if geom is None:
                    logger.warning(f"Feature {idx}: geometry ausente")
                elif isinstance(geom, str):
                    try:
                        feature['geometry'] = json.loads(geom)
                        logger.warning(f"Feature {idx}: geometry estava como string, convertida")
                    except (json.JSONDecodeError, TypeError):
                        logger.error(f"Feature {idx}: geometry string inválida")
            
            logger.info(f"FeatureCollection convertida com {len(feature_collection.get('features', []))} features")
            return feature_collection
        
        # Converter WKBElement para Shapely geometry (geometria única)
        shapely_geom = to_shape(layer.geometry)
        
        # Converter para dict GeoJSON
        geom_dict = mapping(shapely_geom)
        
        # Parsear properties e style
        properties = json.loads(layer.properties) if layer.properties else {}
        style = json.loads(layer.style) if layer.style else {}
        
        # Adicionar metadados às properties
        properties.update({
            "id": layer.id,
            "name": layer.name,
            "description": layer.description,
            "geometry_type": layer.geometry_type,
            "created_at": layer.created_at.isoformat() if layer.created_at else None,
            "updated_at": layer.updated_at.isoformat() if layer.updated_at else None,
            "style": style,
        })
        
        return {
            "type": "Feature",
            "id": layer.id,
            "geometry": geom_dict,
            "properties": properties,
        }
    
    @staticmethod
    def layer_to_response(layer: Layer) -> dict:
        """
        Converte uma camada para formato de resposta da API.
        Se a camada contém uma FeatureCollection, retorna todas as geometrias.
        
        Args:
            layer: Camada a ser convertida
            
        Returns:
            Dict no formato LayerResponse
        """
        # Se tem geojson armazenado (FeatureCollection), retornar ele
        if layer.geojson and layer.feature_count > 1:
            geojson_data = json.loads(layer.geojson)
            
            # Parsear style
            style = json.loads(layer.style) if layer.style else {}
            
            return {
                "id": layer.id,
                "name": layer.name,
                "description": layer.description,
                "geometry_type": "FeatureCollection",
                "geometry": geojson_data,  # FeatureCollection completa
                "properties": {
                    "feature_count": layer.feature_count
                },
                "style": style,
                "created_at": layer.created_at,
                "updated_at": layer.updated_at,
            }
        
        # Converter WKBElement para Shapely geometry (geometria única)
        shapely_geom = to_shape(layer.geometry)
        geom_dict = mapping(shapely_geom)
        
        # Parsear properties e style
        properties = json.loads(layer.properties) if layer.properties else {}
        style = json.loads(layer.style) if layer.style else {}
        
        return {
            "id": layer.id,
            "name": layer.name,
            "description": layer.description,
            "geometry_type": layer.geometry_type,
            "geometry": geom_dict,
            "properties": properties,
            "style": style,
            "created_at": layer.created_at,
            "updated_at": layer.updated_at,
        }
