export const AR_LOGS = {
    INIT: 'Iniciando aplicación AR (Angular)...',
    SCENE_LOADED: 'Escena A-Frame cargada',
    RESIZE: 'Redimensionamiento de renderer detectado',
    CAMERA_NOT_FOUND: 'Elemento locar-camera no encontrado, reintentando...',
    WAITING_LOCAR: 'Esperando inicializacion de componente locar...',
    GPS_INIT: 'Sistema GPS iniciado correctamente. Configurando opciones...',
    GPS_POS_DETERMINED: 'GPS Posicion Inicial Determinada',
    GPS_ERROR: 'Error de GPS critico:',
    POLLING_FALLBACK: 'Usando fallback de polling para carga de lugares',
    LOADING_MARKERS: (count: number) => `Cargando ${count} marcadores en el mapa...`,
    MARKER_ADDED: (name: string, lat: number, lon: number) => `Marcador añadido: ${name} [${lat}, ${lon}]`,
    GPS_UPDATE: (lat: number, lon: number, acc: number) => `GPS Update: Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)} (Precision: ${acc}m)`,
    DISTANCE_DEBUG: (name: string, dist: number) => `Distancia a ${name}: ${dist.toFixed(1)} metros`
};
