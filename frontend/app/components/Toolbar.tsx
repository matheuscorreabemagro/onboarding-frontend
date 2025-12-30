'use client';

import { useMapStore, type ToolMode } from '../store/mapStore';
import Button from './Button';

interface ToolButton {
  id: ToolMode;
  icon: string;
  label: string;
  description: string;
}

export default function Toolbar() {
  const features = useMapStore((s) => s.features);
  const selectedFeatureId = useMapStore((s) => s.selectedFeatureId);
  const removeFeature = useMapStore((s) => s.removeFeature);
  const activeTool = useMapStore((s) => s.activeTool);
  const setActiveTool = useMapStore((s) => s.setActiveTool);

  const tools: ToolButton[] = [
    {
      id: 'draw',
      icon: '✏️',
      label: 'Desenhar',
      description: 'Desenhar nova linha',
    },
    {
      id: 'snap',
      icon: '🧲',
      label: 'Snap',
      description: 'Ativar atração magnética',
    },
    {
      id: 'split',
      icon: '✂️',
      label: 'Cortar',
      description: 'Dividir linha existente',
    },
    {
      id: 'offset',
      icon: '↔️',
      label: 'Offset',
      description: 'Criar linha paralela',
    },
    {
      id: 'simplify',
      icon: '〰️',
      label: 'Suavizar',
      description: 'Suavizar geometria',
    },
  ];

  const handleRemove = () => {
    if (selectedFeatureId) {
      removeFeature(selectedFeatureId);
    }
  };

  const handleToolClick = (toolId: ToolMode) => {
    // Lógica específica para cada ferramenta
    switch (toolId) {
      case 'draw':
        // Desenho simples sem snap
        if (activeTool === 'draw') {
          setActiveTool(null);
        } else {
          setActiveTool('draw');
        }
        break;

      case 'snap':
        // Desenho com snap ativado
        if (activeTool === 'snap') {
          setActiveTool(null);
        } else {
          setActiveTool('snap');
        }
        break;

      case 'split':
        // Split requer uma feature selecionada
        if (!selectedFeatureId) {
          alert('⚠️ Passo a passo para cortar:\n\n1. Clique em uma linha no mapa (ela ficará vermelha)\n2. Clique no botão Cortar ✂️\n3. Desenhe uma linha que cruze a linha selecionada\n4. Duplo clique para finalizar o corte');
          return;
        }
        
        if (activeTool === 'split') {
          setActiveTool(null);
        } else {
          setActiveTool('split');
        }
        break;

      case 'offset':
      case 'simplify':
        // Offset e Simplify executam imediatamente
        if (activeTool === toolId) {
          setActiveTool(null);
        } else {
          setActiveTool(toolId);
        }
        break;

      default:
        setActiveTool(null);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-60 flex flex-col gap-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 min-w-50">
      {/* Título e Contador */}
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Controles
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-800">Total de linhas:</span>
          <span className="text-lg font-bold text-blue-600">{features.length}</span>
        </div>
      </div>

      {/* Ferramentas Geoespaciais */}
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Ferramentas
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => {
            const isActive = activeTool === tool.id;
            const isDisabled =
              (tool.id === 'split' || tool.id === 'offset' || tool.id === 'simplify') &&
              !selectedFeatureId;

            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                disabled={isDisabled}
                className={`group relative rounded-lg px-2 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'scale-105 bg-blue-500 text-white shadow-lg'
                    : isDisabled
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-50'
                    : 'text-gray-800 hover:scale-105 hover:bg-gray-100 hover:shadow-md'
                }`}
                title={tool.description}
              >
                <span className="block text-2xl">{tool.icon}</span>
                <span className="mt-1 block text-xs">{tool.label}</span>
              </button>
            );
          })}
        </div>
        {activeTool && (
          <div className="mt-3 rounded-lg bg-blue-50 p-2">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              {tools.find((t) => t.id === activeTool)?.label} Ativo
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              {activeTool === 'draw' && 'Clique no mapa • Duplo clique finaliza'}
              {activeTool === 'snap' && (
                <>
                  🧲 Desenhe próximo aos vértices<br />
                  Eles grudam automaticamente • Duplo clique finaliza
                </>
              )}
              {activeTool === 'split' && 'Desenhe linha de corte • Duplo clique finaliza'}
              {activeTool === 'offset' && 'Linha paralela será criada'}
              {activeTool === 'simplify' && 'Geometria será suavizada'}
            </p>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="space-y-2">
        {/* Botão Remover (só aparece quando há seleção) */}
        {selectedFeatureId && !activeTool && (
          <Button variant="danger" onClick={handleRemove} className="w-full">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remover Linha
            </span>
          </Button>
        )}
      </div>

      {/* Dica visual do estado */}
      {selectedFeatureId && !activeTool && (
        <div className="mt-2 p-3 bg-red-50 rounded-lg border-2 border-red-400">
          <p className="text-sm font-bold text-red-700 text-center mb-1">
            ✅ LINHA SELECIONADA (Vermelha)
          </p>
          <p className="text-xs text-red-600 text-center">
            Agora você pode usar: Cortar ✂️, Offset ↔️ ou Suavizar 〰️
          </p>
        </div>
      )}
      {!selectedFeatureId && !activeTool && features.length > 0 && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            💡 Clique em uma linha no mapa para selecioná-la
          </p>
        </div>
      )}
    </div>
  );
}
