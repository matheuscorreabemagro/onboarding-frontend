import '@testing-library/jest-dom';

// Mock do Mapbox GL JS
global.mapboxgl = {
  accessToken: 'mock-token',
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
    remove: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    getLayer: jest.fn(() => true),
    getSource: jest.fn(() => ({})),
    setPaintProperty: jest.fn(),
    setLayoutProperty: jest.fn(),
    queryRenderedFeatures: jest.fn(() => []),
    getCanvas: jest.fn(() => ({
      style: { cursor: '' },
    })),
    fitBounds: jest.fn(),
    getBounds: jest.fn(() => ({
      toArray: () => [[-180, -90], [180, 90]],
    })),
    loaded: jest.fn(() => true),
    setStyle: jest.fn(),
    getStyle: jest.fn(() => ({})),
    addControl: jest.fn(),
    removeControl: jest.fn(),
  })),
  NavigationControl: jest.fn(),
  LngLatBounds: jest.fn().mockImplementation(() => ({
    extend: jest.fn().mockReturnThis(),
    isEmpty: jest.fn(() => false),
    toArray: jest.fn(() => [[-180, -90], [180, 90]]),
  })),
};

// Mock do Mapbox Draw
jest.mock('@mapbox/mapbox-gl-draw', () => {
  return jest.fn().mockImplementation(() => ({
    changeMode: jest.fn(),
    getAll: jest.fn(() => ({ type: 'FeatureCollection', features: [] })),
    add: jest.fn(),
    delete: jest.fn(),
    deleteAll: jest.fn(),
    getSelected: jest.fn(() => ({ features: [] })),
    getMode: jest.fn(() => 'simple_select'),
  }));
});

// Mock do Next.js Router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock de process.env
process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'mock-mapbox-token';

// Polyfills para APIs Web não disponíveis em jsdom
// eslint-disable-next-line @typescript-eslint/no-require-imports
global.TextEncoder = require('util').TextEncoder;
// eslint-disable-next-line @typescript-eslint/no-require-imports
global.TextDecoder = require('util').TextDecoder;

// Mock de window.alert
global.alert = jest.fn();

// Mock de URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock de FileReader com suporte assíncrono
class FileReaderMock {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readAsText(blob) {
    // Simula operação assíncrona do FileReader
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: '{"type":"FeatureCollection","features":[]}' } });
      }
    }, 0);
  }
}
global.FileReader = FileReaderMock;

// Mock de File.prototype.text() para arquivos assíncronos
if (typeof File !== 'undefined') {
  File.prototype.text = jest.fn().mockImplementation(function() {
    return Promise.resolve('{"type":"FeatureCollection","features":[]}');
  });
}
