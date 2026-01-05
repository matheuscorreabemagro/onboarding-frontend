'use client';

import { isValidGeoJSON } from '../utils/geojsonValidator';
import React, { useRef, useState, useEffect } from 'react';
import { useMapStore } from '../store/mapStore';
import Alert from './Alert';
import { logger } from '../utils/logger';
import type { GeoJSONFeature } from '../types';

interface FileUploadProps {
  onClose?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onClose }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setFeatures = useMapStore((s) => s.setFeatures);
  const setError = useMapStore((s) => s.setError);
  const error = useMapStore((s) => s.error);
  const [dragActive, setDragActive] = useState(false);

  // Handler para processar o arquivo
  const handleFile = async (file: File) => {
    setError(null); // Limpa erro anterior
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!isValidGeoJSON(data)) {
        setError('Arquivo não é um GeoJSON válido. Verifique a estrutura do arquivo.');
        return;
      }

      let lineFeatures: GeoJSONFeature[] = [];

      // Se for FeatureCollection, filtra LineStrings
      if (data.type === 'FeatureCollection') {
        const totalFeatures = data.features.length;
        lineFeatures = data.features.filter((f: { geometry?: { type: string } }) => f.geometry?.type === 'LineString');

        if (lineFeatures.length === 0) {
          const otherTypes = data.features
            .map((f: { geometry?: { type: string } }) => f.geometry?.type)
            .filter((t: string | undefined) => t && t !== 'LineString')
            .join(', ');

          if (otherTypes) {
            setError(
              `GeoJSON não contém linhas (LineString). Esta aplicação trabalha apenas com linhas.`
            );
          } else {
            setError('GeoJSON não contém nenhuma geometria válida.');
          }
          return;
        }

        // Informa se filtrou algumas features
        if (lineFeatures.length < totalFeatures) {
          logger.warn(
            `⚠️ ${totalFeatures - lineFeatures.length} feature(s) ignorada(s) (apenas LineStrings são suportadas)`
          );
        }
      }
      // Se for Feature única
      else if (data.type === 'Feature') {
        if (data.geometry?.type === 'LineString') {
          lineFeatures = [data];
        } else {
          setError(
            `Geometria tipo "${data.geometry?.type}" não é suportada. Esta aplicação trabalha apenas com linhas (LineString).`
          );
          return;
        }
      } else {
        setError('Formato GeoJSON não suportado. Envie um Feature ou FeatureCollection.');
        return;
      }

      // Converte para o formato do store
      const newFeatures = lineFeatures.map((f: GeoJSONFeature, i: number) => ({
        id: f.id ? String(f.id) : `uploaded-${Date.now()}-${i}`,
        type: 'uploaded' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: f.geometry.coordinates,
        },
        properties: f.properties || {},
      }));

      setFeatures(newFeatures);
      
      // Fecha o modal imediatamente após upload bem-sucedido
      if (onClose) {
        onClose();
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError('Erro ao processar arquivo: JSON inválido.');
      } else {
        setError('Erro ao ler arquivo. Verifique se o arquivo está correto.');
      }
      logger.error('Erro no upload:', e);
    }
  };

  // Handler para input file
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 1) {
      setError('Apenas um arquivo por vez. Selecione apenas um arquivo GeoJSON.');
      return;
    }
    
    const file = files?.[0];
    if (file) handleFile(file);
  };

  // Handler para drag-and-drop
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    
    if (files.length > 1) {
      setError('Apenas um arquivo por vez. Arraste ou selecione apenas um arquivo GeoJSON.');
      return;
    }
    
    const file = files[0];
    if (file) handleFile(file);
  };

  // Auto-hide do erro após 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  return (
    <div className="w-full max-w-md">
      <div className="space-y-3">
        {/* Área de Upload */}
        <div
          className={`group relative rounded-xl border-2 border-dashed bg-white/95 p-8 text-center shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
            dragActive
              ? 'scale-[1.02] border-blue-500 bg-linear-to-br from-blue-50 to-indigo-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-linear-to-br hover:from-gray-50 hover:to-blue-50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{ cursor: 'pointer' }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".geojson,application/geo+json,application/json"
            className="hidden"
            onChange={onChange}
            multiple={false}
          />

          {/* Ícone de Upload */}
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
              dragActive
                ? 'scale-110 bg-blue-500'
                : 'bg-linear-to-br from-blue-500 to-indigo-600 group-hover:scale-110'
            }`}
          >
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800">
              {dragActive ? 'Solte o arquivo aqui' : 'Faça upload do GeoJSON'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 transition-colors hover:text-blue-700">
                Clique para selecionar
              </span>
              {' ou arraste o arquivo'}
            </p>
            <p className="mt-2 text-xs text-gray-400">Apenas arquivos .geojson com LineStrings</p>
          </div>
        </div>

        {/* Alert de Erro */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      </div>
    </div>
  );
};

export default FileUpload;
