import { AR_CONFIG } from '../ar-config';

AFRAME.registerSystem('poi-manager', {
    init: function () {
        this.pois = [];
    },

    loadPois: function (pois) {
        this.pois = pois;
        this.renderPois();
    },

    renderPois: function () {
        const scene = this.el;

        this.pois.forEach(poi => {
            let entity = document.querySelector(`#${poi.id}`);
            if (!entity) {
                entity = document.createElement('a-entity');
                entity.setAttribute('id', poi.id);
                entity.setAttribute(AR_CONFIG.COMPONENTS.LOCAR_PLACE, {
                    latitude: poi.lat,
                    longitude: poi.lng
                });
                entity.setAttribute(AR_CONFIG.COMPONENTS.MARKER, {
                    label: poi.name,
                    distance: poi.distance
                });
                scene.appendChild(entity);
            }
        });
    }
});
