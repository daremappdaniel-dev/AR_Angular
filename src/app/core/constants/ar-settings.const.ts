// Definimos las constantes globales del sistema AR
export const AR_CONSTANTS = {
    // Calidad Gráfica
    GEOMETRY: {
        LOW_POLY_SEGMENTS: 16,
        HIGH_POLY_SEGMENTS: 32,
        DEFAULT_SEGMENTS: 16
    },

    // Renderizado y Distancia
    RENDER: {
        MAX_DISTANCE_METERS: 50,
        PHYSICS_UPDATE_RATE_HZ: 60,
        OCCLUSION_DEPTH_BIAS: 0.001
    },

    // Texturas
    TEXTURES: {
        QUALITY_LOW: 'low' as const,
        QUALITY_MEDIUM: 'medium' as const,
        QUALITY_HIGH: 'high' as const
    },

    // Puntos de Interés (POI)
    POI: {
        VISIBILITY_RADIUS_METERS: 500,
        DEFAULT_MODEL_URL: ''
    },

    // Simulación GPS (Para Dev/Testing)
    GPS_SIMULATION: {
        DEFAULT_ACCURACY_METERS: 10,
        HIGH_ACCURACY: { VALUE: 8, DELAY_MS: 5000 },
        LOW_ACCURACY: { VALUE: 100, DELAY_MS: 100 }
    }
} as const;
