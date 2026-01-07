from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from typing import List
import tempfile
import os
import json
import zipfile
import io
from pathlib import Path
import shutil
import logging

from app.database import get_db
from app.schemas.layer import (
    LayerCreate,
    LayerUpdate,
    LayerResponse,
    LayerListResponse,
    FeatureCollectionResponse,
    UploadResponse,
)
from app.services.layer_service import LayerService
from app.services.format_converter import FormatConverter

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=LayerResponse, status_code=201)
def create_layer(
    layer: LayerCreate,
    db: Session = Depends(get_db)
):
    """
    Cria uma nova camada geoespacial.
    
    - **name**: Nome da camada
    - **description**: Descrição opcional
    - **geometry**: Geometria em formato GeoJSON
    - **properties**: Propriedades adicionais (JSON)
    - **style**: Estilo visual (JSON)
    """
    try:
        db_layer = LayerService.create_layer(db, layer)
        return LayerService.layer_to_response(db_layer)
    except Exception as e:
        logger.error(f"Erro ao criar camada: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=LayerListResponse)
def list_layers(
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(100, ge=1, le=10000, description="Número máximo de registros"),
    db: Session = Depends(get_db)
):
    """
    Lista todas as camadas geoespaciais com paginação.
    """
    layers = LayerService.get_layers(db, skip=skip, limit=limit)
    total = LayerService.count_layers(db)
    
    # Converter camadas para formato de resposta
    items = [LayerService.layer_to_response(layer) for layer in layers]
    
    return {
        "total": total,
        "items": items
    }


@router.get("/geojson", response_model=FeatureCollectionResponse)
def list_layers_geojson(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Lista todas as camadas em formato GeoJSON FeatureCollection.
    Ideal para integração direta com Mapbox.
    """
    layers = LayerService.get_layers(db, skip=skip, limit=limit)
    
    features = [LayerService.layer_to_geojson(layer) for layer in layers]
    
    return {
        "type": "FeatureCollection",
        "features": features
    }


@router.get("/{layer_id}", response_model=LayerResponse)
def get_layer(
    layer_id: int,
    db: Session = Depends(get_db)
):
    """
    Busca uma camada específica por ID.
    """
    layer = LayerService.get_layer(db, layer_id)
    if not layer:
        raise HTTPException(status_code=404, detail="Camada não encontrada")
    return LayerService.layer_to_response(layer)


@router.get("/{layer_id}/geojson")
def get_layer_geojson(
    layer_id: int,
    db: Session = Depends(get_db)
):
    """
    Retorna uma camada específica em formato GeoJSON.
    """
    layer = LayerService.get_layer(db, layer_id)
    if not layer:
        raise HTTPException(status_code=404, detail="Camada não encontrada")
    
    return LayerService.layer_to_geojson(layer)


@router.put("/{layer_id}", response_model=LayerResponse)
def update_layer(
    layer_id: int,
    layer_update: LayerUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza uma camada existente.
    """
    try:
        updated_layer = LayerService.update_layer(db, layer_id, layer_update)
        if not updated_layer:
            raise HTTPException(status_code=404, detail="Camada não encontrada")
        return LayerService.layer_to_response(updated_layer)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar camada: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{layer_id}", status_code=204)
def delete_layer(
    layer_id: int,
    db: Session = Depends(get_db)
):
    """
    Deleta uma camada.
    """
    success = LayerService.delete_layer(db, layer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Camada não encontrada")
    return None


@router.delete("/batch/delete", status_code=200)
def delete_layers_batch(
    layer_ids: list[int],
    db: Session = Depends(get_db)
):
    """
    Deleta múltiplas camadas em lote.
    
    - **layer_ids**: Lista de IDs das camadas a serem deletadas
    """
    deleted_count = 0
    failed_ids = []
    
    for layer_id in layer_ids:
        try:
            success = LayerService.delete_layer(db, layer_id)
            if success:
                deleted_count += 1
            else:
                failed_ids.append(layer_id)
        except Exception as e:
            logger.error(f"Erro ao deletar camada {layer_id}: {str(e)}")
            failed_ids.append(layer_id)
    
    return {
        "deleted_count": deleted_count,
        "total_requested": len(layer_ids),
        "failed_ids": failed_ids
    }


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    layer_name: str = Query(..., description="Nome base para as camadas"),
    db: Session = Depends(get_db)
):
    """
    Faz upload de arquivo geoespacial (GeoJSON, KML ou Shapefile).
    
    - **file**: Arquivo a ser enviado
    - **layer_name**: Nome base para as camadas criadas
    
    Formatos suportados:
    - GeoJSON (.geojson, .json)
    - KML (.kml)
    - Shapefile (.zip contendo .shp, .shx, .dbf, etc.)
    """
    try:
        # Criar diretório temporário
        with tempfile.TemporaryDirectory() as temp_dir:
            # Salvar arquivo enviado
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Determinar tipo de arquivo e converter para GeoJSON
            features = []
            file_ext = Path(file.filename).suffix.lower()
            
            if file_ext in ['.geojson', '.json']:
                # GeoJSON
                with open(file_path, 'r', encoding='utf-8') as f:
                    geojson_data = json.load(f)
                
                if geojson_data.get('type') == 'FeatureCollection':
                    features = geojson_data.get('features', [])
                elif geojson_data.get('type') == 'Feature':
                    features = [geojson_data]
                else:
                    # Geometria única
                    features = [{
                        'type': 'Feature',
                        'geometry': geojson_data,
                        'properties': {}
                    }]
            
            elif file_ext == '.kml':
                # KML
                features = FormatConverter.kml_to_geojson(content)
            
            elif file_ext == '.zip':
                # Shapefile
                shp_path = FormatConverter.extract_shapefile_from_zip(file_path, temp_dir)
                features = FormatConverter.shapefile_to_geojson(shp_path)
            
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Formato de arquivo não suportado: {file_ext}"
                )
            
            # Criar camadas no banco de dados
            layer_ids = []
            for idx, feature in enumerate(features):
                feature_name = feature.get('properties', {}).get('name', f"{layer_name}_{idx + 1}")
                
                layer_data = LayerCreate(
                    name=feature_name,
                    description=feature.get('properties', {}).get('description'),
                    geometry=feature['geometry'],
                    properties=feature.get('properties', {}),
                )
                
                db_layer = LayerService.create_layer(db, layer_data)
                layer_ids.append(db_layer.id)
            
            return {
                "message": f"Upload concluído com sucesso",
                "layers_created": len(layer_ids),
                "layer_ids": layer_ids
            }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no upload: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro ao processar arquivo: {str(e)}")


@router.get("/{layer_id}/export/{format}")
async def export_layer(
    layer_id: int,
    format: str,
    db: Session = Depends(get_db)
):
    """
    Exporta uma camada em formato específico.
    
    - **layer_id**: ID da camada
    - **format**: Formato de exportação (geojson, kml, shapefile)
    """
    if format not in ["geojson", "kml", "shapefile"]:
        raise HTTPException(status_code=400, detail="Formato inválido. Use: geojson, kml ou shapefile")
    try:
        layer = LayerService.get_layer(db, layer_id)
        if not layer:
            raise HTTPException(status_code=404, detail="Camada não encontrada")
        
        # Converter para GeoJSON (retorna Feature ou FeatureCollection)
        geojson_data = LayerService.layer_to_geojson(layer)
        
        # Preparar lista de features para conversão
        if geojson_data.get('type') == 'FeatureCollection':
            features = geojson_data.get('features', [])
        else:
            features = [geojson_data]
        
        if format == "geojson":
            # Retornar como JSON
            return StreamingResponse(
                iter([json.dumps(geojson_data, indent=2)]),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename={layer.name}.geojson"}
            )
        
        elif format == "kml":
            # Converter para KML
            kml_content = FormatConverter.geojson_to_kml(features, layer.name)
            return StreamingResponse(
                iter([kml_content]),
                media_type="application/vnd.google-earth.kml+xml",
                headers={"Content-Disposition": f"attachment; filename={layer.name}.kml"}
            )
        
        elif format == "shapefile":
            # Criar Shapefile e retornar como ZIP
            with tempfile.TemporaryDirectory() as temp_dir:
                # Adicionar .shp ao caminho
                shp_base = os.path.join(temp_dir, layer.name)
                shp_path = f"{shp_base}.shp"
                
                FormatConverter.geojson_to_shapefile(features, shp_path)
                
                # Criar ZIP em memória com todos os arquivos do Shapefile
                zip_buffer = io.BytesIO()
                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for file in os.listdir(temp_dir):
                        if file.startswith(layer.name):
                            file_path = os.path.join(temp_dir, file)
                            zipf.write(file_path, arcname=file)
                
                # Voltar ao início do buffer
                zip_buffer.seek(0)
                
                return StreamingResponse(
                    iter([zip_buffer.getvalue()]),
                    media_type="application/zip",
                    headers={"Content-Disposition": f"attachment; filename={layer.name}.zip"}
                )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro na exportação: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro ao exportar: {str(e)}")


@router.post("/{layer_id}/export/batch")
async def export_layer_batch(
    layer_id: int,
    formats: List[str],
    db: Session = Depends(get_db)
):
    """
    Exporta uma camada em múltiplos formatos de uma só vez.
    
    - **layer_id**: ID da camada
    - **formats**: Lista de formatos (geojson, kml, shp)
    
    Retorna um ZIP contendo todos os formatos solicitados.
    """
    try:
        # Validar formatos
        valid_formats = {"geojson", "kml", "shp"}
        invalid = [f for f in formats if f not in valid_formats]
        if invalid:
            raise HTTPException(status_code=400, detail=f"Formatos inválidos: {', '.join(invalid)}")
        
        layer = LayerService.get_layer(db, layer_id)
        if not layer:
            raise HTTPException(status_code=404, detail="Camada não encontrada")
        
        # Converter para GeoJSON
        geojson_data = LayerService.layer_to_geojson(layer)
        
        # Preparar lista de features
        if geojson_data.get('type') == 'FeatureCollection':
            features = geojson_data.get('features', [])
        else:
            features = [geojson_data]
        
        # Remover extensão do nome da camada se existir
        base_name = layer.name
        for ext in ['.geojson', '.json', '.kml', '.shp', '.zip']:
            if base_name.lower().endswith(ext):
                base_name = base_name[:-len(ext)]
                break
        
        # Criar ZIP em memória com todos os formatos
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            
            # GeoJSON
            if "geojson" in formats:
                geojson_content = json.dumps(geojson_data, indent=2)
                zipf.writestr(f"{base_name}.geojson", geojson_content)
            
            # KML
            if "kml" in formats:
                try:
                    kml_content = FormatConverter.geojson_to_kml(features, base_name)
                    zipf.writestr(f"{base_name}.kml", kml_content)
                except Exception as e:
                    logger.error(f"Erro ao gerar KML: {str(e)}")
                    # Adicionar arquivo de erro
                    zipf.writestr(f"{base_name}_kml_error.txt", f"Erro ao gerar KML: {str(e)}")
            
            # Shapefile (organizar em subpasta)
            if "shp" in formats:
                try:
                    with tempfile.TemporaryDirectory() as temp_dir:
                        # Adicionar .shp ao caminho para o Fiona
                        shp_path = os.path.join(temp_dir, f"{base_name}.shp")
                        FormatConverter.geojson_to_shapefile(features, shp_path)
                        
                        # Adicionar todos os arquivos do Shapefile ao ZIP dentro de uma subpasta
                        for file in os.listdir(temp_dir):
                            if file.startswith(base_name):
                                file_path = os.path.join(temp_dir, file)
                                # Adicionar dentro da pasta "shapefile/"
                                zipf.write(file_path, arcname=f"shapefile/{file}")
                except Exception as e:
                    logger.error(f"Erro ao gerar Shapefile: {str(e)}", exc_info=True)
                    # Adicionar arquivo de erro
                    zipf.writestr(f"{base_name}_shp_error.txt", f"Erro ao gerar Shapefile: {str(e)}")
        
        zip_buffer.seek(0)
        
        return StreamingResponse(
            iter([zip_buffer.getvalue()]),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={base_name}_export.zip"}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro na exportação em lote: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro ao exportar: {str(e)}")


@router.get("/export/all/{format}")
async def export_all_layers(
    format: str,
    db: Session = Depends(get_db)
):
    """
    Exporta todas as camadas em formato específico.
    
    - **format**: Formato de exportação (geojson, kml, shapefile)
    """
    if format not in ["geojson", "kml", "shapefile"]:
        raise HTTPException(status_code=400, detail="Formato inválido. Use: geojson, kml ou shapefile")
    
    try:
        layers = LayerService.get_layers(db, skip=0, limit=10000)
        
        if not layers:
            raise HTTPException(status_code=404, detail="Nenhuma camada encontrada")
        
        features = [LayerService.layer_to_geojson(layer) for layer in layers]
        
        # Garantir que properties seja dicionário em todas as features
        for feature in features:
            if isinstance(feature.get('properties'), str):
                feature['properties'] = json.loads(feature['properties'])
        
        if format == "geojson":
            # FeatureCollection
            feature_collection = {
                "type": "FeatureCollection",
                "features": features
            }
            return StreamingResponse(
                iter([json.dumps(feature_collection, indent=2)]),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=all_layers.geojson"}
            )
        
        elif format == "kml":
            kml_content = FormatConverter.geojson_to_kml(features, "All Layers")
            return StreamingResponse(
                iter([kml_content]),
                media_type="application/vnd.google-earth.kml+xml",
                headers={"Content-Disposition": "attachment; filename=all_layers.kml"}
            )
        
        elif format == "shapefile":
            # Para múltiplas features, criar um único Shapefile
            with tempfile.TemporaryDirectory() as temp_dir:
                shp_path = os.path.join(temp_dir, "all_layers.shp")
                FormatConverter.geojson_to_shapefile(features, shp_path)
                
                zip_path = os.path.join(temp_dir, "all_layers.zip")
                with zipfile.ZipFile(zip_path, 'w') as zipf:
                    for file in os.listdir(temp_dir):
                        if file.startswith("all_layers") and not file.endswith('.zip'):
                            zipf.write(
                                os.path.join(temp_dir, file),
                                arcname=file
                            )
                
                return FileResponse(
                    zip_path,
                    media_type="application/zip",
                    filename="all_layers.zip"
                )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro na exportação: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro ao exportar: {str(e)}")
