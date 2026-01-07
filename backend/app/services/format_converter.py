import json
import zipfile
import tempfile
import os
from typing import List, Dict, Any
from pathlib import Path
import fiona
from shapely.geometry import shape, mapping
import logging
import html

logger = logging.getLogger(__name__)


class FormatConverter:
    """Service para conversão entre formatos geoespaciais."""
    
    @staticmethod
    def geojson_to_dict(geojson_data: str | dict) -> dict:
        """
        Converte GeoJSON (string ou dict) para dict Python.
        
        Args:
            geojson_data: Dados GeoJSON
            
        Returns:
            Dict Python com dados GeoJSON
        """
        if isinstance(geojson_data, str):
            return json.loads(geojson_data)
        return geojson_data
    
    @staticmethod
    def kml_to_geojson(kml_content: str | bytes) -> List[Dict[str, Any]]:
        """
        Converte KML para lista de features GeoJSON.
        
        Args:
            kml_content: Conteúdo KML (string ou bytes)
            
        Returns:
            Lista de features no formato GeoJSON
        """
        try:
            if isinstance(kml_content, str):
                kml_content = kml_content.encode('utf-8')
            
            # Parse KML
            k = kml.KML()
            k.from_string(kml_content)
            
            features = []
            
            # Iterar por documentos e features
            for document in k.features():
                for folder in document.features():
                    for placemark in folder.features():
                        if placemark.geometry:
                            feature = {
                                "type": "Feature",
                                "geometry": mapping(placemark.geometry),
                                "properties": {
                                    "name": placemark.name or "",
                                    "description": placemark.description or "",
                                }
                            }
                            features.append(feature)
            
            # Se não houver folders, tentar placemarks diretos
            if not features:
                for feature_elem in k.features():
                    if hasattr(feature_elem, 'geometry') and feature_elem.geometry:
                        feature = {
                            "type": "Feature",
                            "geometry": mapping(feature_elem.geometry),
                            "properties": {
                                "name": feature_elem.name or "",
                                "description": feature_elem.description or "",
                            }
                        }
                        features.append(feature)
            
            logger.info(f"KML convertido: {len(features)} features encontradas")
            return features
            
        except Exception as e:
            logger.error(f"Erro ao converter KML: {str(e)}")
            raise ValueError(f"Erro ao processar arquivo KML: {str(e)}")
    
    @staticmethod
    def shapefile_to_geojson(shapefile_path: str) -> List[Dict[str, Any]]:
        """
        Converte Shapefile para lista de features GeoJSON.
        
        Args:
            shapefile_path: Caminho para o arquivo .shp
            
        Returns:
            Lista de features no formato GeoJSON
        """
        try:
            features = []
            
            with fiona.open(shapefile_path, 'r') as source:
                for feature in source:
                    # Converter para formato GeoJSON padrão
                    geojson_feature = {
                        "type": "Feature",
                        "geometry": feature['geometry'],
                        "properties": dict(feature['properties'])
                    }
                    features.append(geojson_feature)
            
            logger.info(f"Shapefile convertido: {len(features)} features encontradas")
            return features
            
        except Exception as e:
            logger.error(f"Erro ao converter Shapefile: {str(e)}")
            raise ValueError(f"Erro ao processar Shapefile: {str(e)}")
    
    @staticmethod
    def extract_shapefile_from_zip(zip_path: str, extract_to: str) -> str:
        """
        Extrai Shapefile de um arquivo ZIP.
        
        Args:
            zip_path: Caminho para o arquivo ZIP
            extract_to: Diretório de extração
            
        Returns:
            Caminho para o arquivo .shp extraído
        """
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
            
            # Procurar arquivo .shp
            for root, dirs, files in os.walk(extract_to):
                for file in files:
                    if file.endswith('.shp'):
                        shp_path = os.path.join(root, file)
                        logger.info(f"Shapefile encontrado: {shp_path}")
                        return shp_path
            
            raise ValueError("Arquivo .shp não encontrado no ZIP")
            
        except Exception as e:
            logger.error(f"Erro ao extrair Shapefile: {str(e)}")
            raise
    
    @staticmethod
    def geojson_to_kml(features: List[Dict[str, Any]], layer_name: str = "Layer") -> str:
        """
        Converte lista de features GeoJSON para KML usando geração manual de XML.
        
        Args:
            features: Lista de features GeoJSON
            layer_name: Nome da camada
            
        Returns:
            String KML
        """
        try:
            logger.info(f"Iniciando conversão para KML de {len(features)} features")
            
            # Escapar nome da camada
            safe_layer_name = html.escape(layer_name)
            
            # Construir KML manualmente
            kml_parts = [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<kml xmlns="http://www.opengis.net/kml/2.2">',
                '  <Document>',
                f'    <name>{safe_layer_name}</name>',
                '    <description>Exported from GeoApp</description>',
            ]
            
            # Adicionar cada feature como Placemark
            for idx, feature in enumerate(features):
                # Processar geometry
                geometry = feature.get('geometry')
                
                if isinstance(geometry, str):
                    try:
                        geometry = json.loads(geometry)
                    except (json.JSONDecodeError, TypeError):
                        logger.warning(f"Feature {idx}: geometry inválida")
                        continue
                
                if not geometry:
                    logger.warning(f"Feature {idx}: geometry ausente")
                    continue
                
                # Processar properties
                props = feature.get('properties', {})
                if isinstance(props, str):
                    try:
                        props = json.loads(props)
                    except (json.JSONDecodeError, TypeError):
                        props = {}
                elif not isinstance(props, dict):
                    props = {}
                
                # Nome e descrição (escapar caracteres especiais XML)
                name = html.escape(str(props.get('name', f'Feature {idx}')))
                description = html.escape(str(props.get('description', '')))
                
                # Converter geometry para KML
                kml_geometry = FormatConverter._geometry_to_kml(geometry)
                if not kml_geometry:
                    logger.warning(f"Feature {idx}: tipo de geometria não suportado")
                    continue
                
                # Adicionar Placemark
                kml_parts.append('    <Placemark>')
                kml_parts.append(f'      <name>{name}</name>')
                if description:
                    kml_parts.append(f'      <description>{description}</description>')
                
                # Adicionar propriedades como ExtendedData
                if props:
                    kml_parts.append('      <ExtendedData>')
                    for key, value in props.items():
                        if key not in ['name', 'description', 'backendId']:
                            safe_key = html.escape(str(key))
                            safe_value = html.escape(str(value))
                            kml_parts.append(f'        <Data name="{safe_key}">')
                            kml_parts.append(f'          <value>{safe_value}</value>')
                            kml_parts.append('        </Data>')
                    kml_parts.append('      </ExtendedData>')
                
                kml_parts.append(kml_geometry)
                kml_parts.append('    </Placemark>')
            
            kml_parts.append('  </Document>')
            kml_parts.append('</kml>')
            
            result = '\n'.join(kml_parts)
            logger.info(f"KML gerado com sucesso: {len(result)} caracteres")
            return result
            
        except Exception as e:
            logger.error(f"Erro ao converter para KML: {str(e)}", exc_info=True)
            raise ValueError(f"Erro ao gerar KML: {str(e)}")
    
    @staticmethod
    def _geometry_to_kml(geometry: Dict[str, Any]) -> str:
        """
        Converte uma geometria GeoJSON para formato KML.
        
        Args:
            geometry: Geometria GeoJSON
            
        Returns:
            String XML do KML geometry
        """
        geom_type = geometry.get('type')
        coordinates = geometry.get('coordinates')
        
        if not coordinates:
            return ""
        
        if geom_type == 'Point':
            lon, lat = coordinates[:2]
            alt = coordinates[2] if len(coordinates) > 2 else 0
            return f'      <Point><coordinates>{lon},{lat},{alt}</coordinates></Point>'
        
        elif geom_type == 'LineString':
            coords_str = ' '.join(
                f"{lon},{lat},{alt if len(coord) > 2 else 0}"
                for coord in coordinates
                for lon, lat, *rest in [coord]
                for alt in [rest[0] if rest else 0]
            )
            return f'      <LineString><coordinates>{coords_str}</coordinates></LineString>'
        
        elif geom_type == 'Polygon':
            kml_parts = ['      <Polygon>']
            
            # Exterior ring
            if coordinates and len(coordinates) > 0:
                exterior = coordinates[0]
                coords_str = ' '.join(
                    f"{coord[0]},{coord[1]},{coord[2] if len(coord) > 2 else 0}"
                    for coord in exterior
                )
                kml_parts.append(f'        <outerBoundaryIs><LinearRing><coordinates>{coords_str}</coordinates></LinearRing></outerBoundaryIs>')
            
            # Interior rings (holes)
            for ring in coordinates[1:]:
                coords_str = ' '.join(
                    f"{coord[0]},{coord[1]},{coord[2] if len(coord) > 2 else 0}"
                    for coord in ring
                )
                kml_parts.append(f'        <innerBoundaryIs><LinearRing><coordinates>{coords_str}</coordinates></LinearRing></innerBoundaryIs>')
            
            kml_parts.append('      </Polygon>')
            return '\n'.join(kml_parts)
        
        elif geom_type == 'MultiPoint':
            kml_parts = ['      <MultiGeometry>']
            for coord in coordinates:
                lon, lat = coord[:2]
                alt = coord[2] if len(coord) > 2 else 0
                kml_parts.append(f'        <Point><coordinates>{lon},{lat},{alt}</coordinates></Point>')
            kml_parts.append('      </MultiGeometry>')
            return '\n'.join(kml_parts)
        
        elif geom_type == 'MultiLineString':
            kml_parts = ['      <MultiGeometry>']
            for line in coordinates:
                coords_str = ' '.join(
                    f"{coord[0]},{coord[1]},{coord[2] if len(coord) > 2 else 0}"
                    for coord in line
                )
                kml_parts.append(f'        <LineString><coordinates>{coords_str}</coordinates></LineString>')
            kml_parts.append('      </MultiGeometry>')
            return '\n'.join(kml_parts)
        
        elif geom_type == 'MultiPolygon':
            kml_parts = ['      <MultiGeometry>']
            for polygon in coordinates:
                kml_parts.append('        <Polygon>')
                
                # Exterior ring
                if polygon and len(polygon) > 0:
                    exterior = polygon[0]
                    coords_str = ' '.join(
                        f"{coord[0]},{coord[1]},{coord[2] if len(coord) > 2 else 0}"
                        for coord in exterior
                    )
                    kml_parts.append(f'          <outerBoundaryIs><LinearRing><coordinates>{coords_str}</coordinates></LinearRing></outerBoundaryIs>')
                
                # Interior rings
                for ring in polygon[1:]:
                    coords_str = ' '.join(
                        f"{coord[0]},{coord[1]},{coord[2] if len(coord) > 2 else 0}"
                        for coord in ring
                    )
                    kml_parts.append(f'          <innerBoundaryIs><LinearRing><coordinates>{coords_str}</coordinates></LinearRing></innerBoundaryIs>')
                
                kml_parts.append('        </Polygon>')
            kml_parts.append('      </MultiGeometry>')
            return '\n'.join(kml_parts)
        
        return ""
    
    @staticmethod
    def geojson_to_shapefile(features: List[Dict[str, Any]], output_path: str):
        """
        Converte lista de features GeoJSON para Shapefile.
        
        Args:
            features: Lista de features GeoJSON
            output_path: Caminho para salvar o Shapefile
        """
        try:
            if not features:
                raise ValueError("Nenhuma feature para exportar")
            
            # Determinar tipo de geometria e schema
            first_geom = shape(features[0]['geometry'])
            geom_type = first_geom.geom_type
            
            # Coletar todas as propriedades
            all_props = {}
            for feature in features:
                props = feature.get('properties', {})
                
                # Garantir que props seja um dicionário
                if isinstance(props, str):
                    try:
                        props = json.loads(props)
                    except (json.JSONDecodeError, TypeError):
                        props = {}
                elif not isinstance(props, dict):
                    props = {}
                
                for key, value in props.items():
                    if key not in all_props:
                        # Determinar tipo da propriedade
                        if isinstance(value, int):
                            all_props[key] = 'int'
                        elif isinstance(value, float):
                            all_props[key] = 'float'
                        else:
                            all_props[key] = 'str'
            
            # Definir schema
            schema = {
                'geometry': geom_type,
                'properties': all_props
            }
            
            # Escrever Shapefile
            with fiona.open(
                output_path,
                'w',
                driver='ESRI Shapefile',
                crs='EPSG:4326',
                schema=schema
            ) as output:
                for feature in features:
                    # Obter properties e garantir que seja dict
                    feature_props = feature.get('properties', {})
                    if isinstance(feature_props, str):
                        try:
                            feature_props = json.loads(feature_props)
                        except (json.JSONDecodeError, TypeError):
                            feature_props = {}
                    elif not isinstance(feature_props, dict):
                        feature_props = {}
                    
                    # Preparar properties
                    props = {}
                    for key, prop_type in all_props.items():
                        value = feature_props.get(key)
                        if value is None:
                            value = 0 if prop_type == 'int' else (0.0 if prop_type == 'float' else '')
                        props[key] = value
                    
                    output.write({
                        'geometry': feature['geometry'],
                        'properties': props
                    })
            
            logger.info(f"Shapefile criado: {output_path}")
            
        except Exception as e:
            logger.error(f"Erro ao criar Shapefile: {str(e)}")
            raise ValueError(f"Erro ao gerar Shapefile: {str(e)}")
