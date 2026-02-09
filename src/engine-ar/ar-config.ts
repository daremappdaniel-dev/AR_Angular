export const AR_CONFIG = {
    MARKER: {
        NEAR_THRESHOLD: 1000,
        DEFAULT_NAME: 'Lugar Desconocido',
        DEFAULT_GEOMETRY: 'primitive: plane; width: 1; height: 1',
        HEIGHT_OFFSET: 1.6,
        SCALE: {
            NEAR: '15 15 15',
            FAR: '15 15 15'
        },
        DEFAULT_MODEL_PATH: 'assets/daremapp/marcador.png'
    },
    SYSTEM: {
        LOCAR_CAMERA_SELECTOR: '[locar-camera]',
        LOOK_AT_TARGET: '[camera]'
    },
    COMPONENTS: {
        LOCAR_PLACE: 'locar-entity-place',
        MARKER: 'place-marker'
    }
};
