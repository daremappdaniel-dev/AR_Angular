export const AR_CONFIG = {
    GPS: {
        MIN_DISTANCE: 5,
        MIN_ACCURACY: 100,
        ELEVATION: 1.6
    },
    ORIENTATION: {
        SMOOTHING_FACTOR: 0.1,
        CHANGE_THRESHOLD: 0.02,
        ENABLE_PERMISSION_DIALOG: false
    },
    EVENTS: {
        GPS_UPDATE: 'locar-gps-update'
    },
    MARKER: {
        NEAR_THRESHOLD: 50,
        DEFAULT_NAME: 'Lugar Desconocido',
        DEFAULT_GEOMETRY: 'primitive: plane; width: 1; height: 1',
        HEIGHT_OFFSET: 1.6,
        SCALE: {
            NEAR: '5 5 5',
            FAR: '5 5 5'
        },
        DEFAULT_MODEL_PATH: './assets/daremapp/marcador.png'
    },
    SYSTEM: {
        LOCAR_CAMERA_SELECTOR: '[locar-camera-custom]',
        LOOK_AT_TARGET: '[camera]'
    },
    COMPONENTS: {
        LOCAR_PLACE: 'locar-entity-place',
        MARKER: 'place-marker'
    },
    FADE: {
        START: 40,
        END: 50,
        BASE_SCALE: 5
    },
    POI: {
        DEFAULT_MODEL: './assets/daremapp/marcador.png',
        POLLING_INTERVAL: 3000,
        TRIGGER_DISTANCE: 20
    }
} as const;

