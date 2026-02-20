import { AR_CONFIG } from '../ar-config';

AFRAME.registerSystem('poi-manager', {
    init: function () {
        this.pois = [];
    },

    setMarkers: function (pois) {
        this.pois = pois;
        this.render();
    },

    render: function () {
        const scene = this.el;

        this.pois.forEach((poi, index) => {
            const id = poi.id || `poi-${index}`;
            if (document.querySelector(`#${id}`)) return;

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

            scene.appendChild(entity);
        });
    }
});
