import { AR_CONFIG } from '../ar-config';

AFRAME.registerSystem('poi-manager', {
    init: function () {
        this.pois = [];
        this.entityPool = new Map();
    },

    initializeEntities: function (allPois) {
        const scene = this.el;

        allPois.forEach((poi) => {
            const id = `poi-${poi.name}`;
            const entity = document.createElement('a-entity');

            entity.setAttribute('id', id);
            entity.setAttribute(AR_CONFIG.COMPONENTS.LOCAR_PLACE, {
                latitude: poi.lat,
                longitude: poi.lng || poi.lon
            });
            entity.setAttribute(AR_CONFIG.COMPONENTS.MARKER, {
                name: poi.name,
                model: AR_CONFIG.POI.DEFAULT_MODEL
            });
            entity.setAttribute('scale', AR_CONFIG.MARKER.SCALE.NEAR);
            entity.setAttribute('visible', false);

            scene.appendChild(entity);
            this.entityPool.set(id, entity);
        });
    },

    setMarkers: function (pois) {
        this.pois = pois;
        this.updateVisibility();
    },

    updateVisibility: function () {
        const visibleIds = this._getVisibleIds();
        this._syncVisibility(visibleIds);
    },

    _getVisibleIds: function () {
        return new Set(this.pois.map(poi => `poi-${poi.name}`));
    },

    _syncVisibility: function (visibleIds) {
        this.entityPool.forEach((entity, id) => {
            if (entity.object3D) {
                entity.object3D.visible = visibleIds.has(id);
            }
        });
    }
});
