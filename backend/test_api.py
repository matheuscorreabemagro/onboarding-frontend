#!/usr/bin/env python3
"""
Script de teste para a API GeoApp.
Demonstra todas as funcionalidades principais.
"""

import requests
import json
from pathlib import Path

# Configuração
API_BASE_URL = "http://localhost:8000/api/v1"
HEADERS = {"Content-Type": "application/json"}


def print_section(title):
    """Imprime título de seção."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def test_health():
    """Testa health check."""
    print_section("1. Health Check")
    
    response = requests.get("http://localhost:8000/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")


def test_create_point():
    """Cria uma camada de ponto."""
    print_section("2. Criar Camada - Ponto")
    
    data = {
        "name": "Ponto de Teste",
        "description": "Um ponto em São Paulo",
        "geometry": {
            "type": "Point",
            "coordinates": [-46.6333, -23.5505]
        },
        "properties": {
            "cidade": "São Paulo",
            "tipo": "Marco"
        },
        "style": {
            "fill": "#FF0000",
            "radius": 8
        }
    }
    
    response = requests.post(f"{API_BASE_URL}/layers/", json=data, headers=HEADERS)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Layer criada: ID={result['id']}, Nome={result['name']}")
    return result['id']


def test_create_polygon():
    """Cria uma camada de polígono."""
    print_section("3. Criar Camada - Polígono")
    
    data = {
        "name": "Polígono de Teste",
        "description": "Um polígono representando uma área",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-46.6500, -23.5500],
                [-46.6400, -23.5500],
                [-46.6400, -23.5600],
                [-46.6500, -23.5600],
                [-46.6500, -23.5500]
            ]]
        },
        "properties": {
            "area_nome": "Zona Teste"
        },
        "style": {
            "fill": "#00FF00",
            "stroke": "#00AA00",
            "fill-opacity": 0.6
        }
    }
    
    response = requests.post(f"{API_BASE_URL}/layers/", json=data, headers=HEADERS)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Layer criada: ID={result['id']}, Nome={result['name']}")
    return result['id']


def test_list_layers():
    """Lista todas as camadas."""
    print_section("4. Listar Camadas")
    
    response = requests.get(f"{API_BASE_URL}/layers/")
    result = response.json()
    
    print(f"Total de camadas: {result['total']}")
    for layer in result['items']:
        print(f"  - ID: {layer['id']}, Nome: {layer['name']}, Tipo: {layer['geometry_type']}")


def test_get_layer_geojson(layer_id):
    """Busca uma camada em formato GeoJSON."""
    print_section(f"5. Buscar Camada {layer_id} como GeoJSON")
    
    response = requests.get(f"{API_BASE_URL}/layers/{layer_id}/geojson")
    result = response.json()
    
    print(f"Feature Type: {result['type']}")
    print(f"Geometry Type: {result['geometry']['type']}")
    print(f"Properties: {json.dumps(result['properties'], indent=2)}")


def test_get_all_geojson():
    """Busca todas as camadas como FeatureCollection."""
    print_section("6. Buscar Todas as Camadas como FeatureCollection")
    
    response = requests.get(f"{API_BASE_URL}/layers/geojson")
    result = response.json()
    
    print(f"Type: {result['type']}")
    print(f"Número de features: {len(result['features'])}")
    for feature in result['features']:
        props = feature['properties']
        print(f"  - {props['name']} ({feature['geometry']['type']})")


def test_update_layer(layer_id):
    """Atualiza uma camada."""
    print_section(f"7. Atualizar Camada {layer_id}")
    
    data = {
        "name": "Ponto Atualizado",
        "description": "Descrição atualizada via API",
        "style": {
            "fill": "#0000FF",
            "radius": 10
        }
    }
    
    response = requests.put(f"{API_BASE_URL}/layers/{layer_id}", json=data, headers=HEADERS)
    result = response.json()
    
    print(f"Status: {response.status_code}")
    print(f"Nome atualizado: {result['name']}")
    print(f"Descrição atualizada: {result['description']}")


def test_upload_geojson():
    """Testa upload de arquivo GeoJSON."""
    print_section("8. Upload de Arquivo GeoJSON")
    
    # Criar arquivo GeoJSON temporário
    geojson_data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-46.6400, -23.5600]
                },
                "properties": {
                    "name": "Ponto via Upload",
                    "tipo": "Teste"
                }
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [-46.6400, -23.5600],
                        [-46.6450, -23.5650]
                    ]
                },
                "properties": {
                    "name": "Linha via Upload"
                }
            }
        ]
    }
    
    # Salvar temporariamente
    temp_file = Path("/tmp/test_upload.geojson")
    with open(temp_file, 'w') as f:
        json.dump(geojson_data, f)
    
    # Upload
    with open(temp_file, 'rb') as f:
        files = {'file': ('test_upload.geojson', f, 'application/json')}
        response = requests.post(
            f"{API_BASE_URL}/layers/upload?layer_name=Upload_Test",
            files=files
        )
    
    result = response.json()
    print(f"Status: {response.status_code}")
    print(f"Mensagem: {result['message']}")
    print(f"Camadas criadas: {result['layers_created']}")
    print(f"IDs: {result['layer_ids']}")
    
    # Limpar
    temp_file.unlink()
    
    return result['layer_ids']


def test_export_layer(layer_id, format_type="geojson"):
    """Testa exportação de camada."""
    print_section(f"9. Exportar Camada {layer_id} como {format_type.upper()}")
    
    response = requests.get(f"{API_BASE_URL}/layers/{layer_id}/export/{format_type}")
    
    if response.status_code == 200:
        output_file = f"/tmp/layer_{layer_id}.{format_type if format_type != 'shapefile' else 'zip'}"
        with open(output_file, 'wb') as f:
            f.write(response.content)
        print(f"Status: {response.status_code}")
        print(f"Arquivo salvo em: {output_file}")
        print(f"Tamanho: {len(response.content)} bytes")
    else:
        print(f"Erro: {response.status_code}")


def test_delete_layer(layer_id):
    """Deleta uma camada."""
    print_section(f"10. Deletar Camada {layer_id}")
    
    response = requests.delete(f"{API_BASE_URL}/layers/{layer_id}")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 204:
        print("✓ Camada deletada com sucesso")
    else:
        print(f"✗ Erro ao deletar: {response.text}")


def main():
    """Executa todos os testes."""
    print("\n" + "="*60)
    print("  TESTE COMPLETO DA API GeoApp")
    print("="*60)
    
    try:
        # 1. Health check
        test_health()
        
        # 2. Criar camadas
        point_id = test_create_point()
        polygon_id = test_create_polygon()
        
        # 3. Listar camadas
        test_list_layers()
        
        # 4. Buscar camada específica
        test_get_layer_geojson(point_id)
        
        # 5. Buscar todas as camadas
        test_get_all_geojson()
        
        # 6. Atualizar camada
        test_update_layer(point_id)
        
        # 7. Upload de arquivo
        uploaded_ids = test_upload_geojson()
        
        # 8. Exportar camadas
        test_export_layer(point_id, "geojson")
        test_export_layer(polygon_id, "kml")
        # test_export_layer(polygon_id, "shapefile")  # Descomente se quiser testar
        
        # 9. Deletar camadas de teste do upload
        for layer_id in uploaded_ids:
            test_delete_layer(layer_id)
        
        print_section("✓ TODOS OS TESTES CONCLUÍDOS COM SUCESSO")
        
    except requests.exceptions.ConnectionError:
        print("\n✗ ERRO: Não foi possível conectar à API.")
        print("Certifique-se de que o backend está rodando em http://localhost:8000")
    except Exception as e:
        print(f"\n✗ ERRO: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
