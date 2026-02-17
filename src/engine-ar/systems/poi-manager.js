import { AR_CONFIG } from '../ar-config';

AFRAME.registerSystem('poi-manager', {
    init: function () {
        this.pois = [];
        this.entityPool = new Map();
        this.worldOrigin = new THREE.Vector3(0, 0, 0);

        this.targetContainer = null;
    },


    initializeEntities: function (allPois, userLocation) {

        if (!this.targetContainer) {
            this.targetContainer = document.querySelector('#ar-content-group') ||
                document.querySelector('#ar-world-root') ||
                this.el.sceneEl;
        }

        let originVec = { x: 0, z: 0 };

        const locarEntity = this.el.querySelector('[locar-camera]');
        const locar = locarEntity && locarEntity.components['locar-camera'] ? locarEntity.components['locar-camera'].locar : null;

        if (userLocation && locar) {
            const originCoords = locar.lonLatToWorldCoords(userLocation.lng, userLocation.lat);
            originVec = { x: originCoords[0], z: originCoords[1] };
            this.worldOrigin.set(originVec.x, 0, originVec.z);
        } else if (userLocation && !locar) {
        }


        allPois.forEach((poi) => {
            const id = `poi-${poi.name}`;
            let entity = this.entityPool.get(id);

            if (!entity) {
                entity = document.createElement('a-entity');
                entity.setAttribute('id', id);

                entity.setAttribute(AR_CONFIG.COMPONENTS.MARKER, {
                    name: poi.name,
                    model: poi.model || AR_CONFIG.POI.DEFAULT_MODEL
                });
                entity.setAttribute('scale', AR_CONFIG.MARKER.SCALE.NEAR);
                entity.classList.add('clickable');

                entity.object3D.visible = false;

                this.targetContainer.appendChild(entity);
                this.entityPool.set(id, entity);
            }

            let x = 0, z = 0;

            if (locar) {
                const poiCoords = locar.lonLatToWorldCoords(poi.lng || poi.lon, poi.lat);
                x = poiCoords[0] - this.worldOrigin.x;
                z = poiCoords[1] - this.worldOrigin.z;
            } else {
                x = poi.x || 0;
                z = poi.z || 0;
            }
            if (entity.object3D) {
                entity.object3D.position.set(x, 0, z);
            } else {
                entity.addEventListener('loaded', () => {
                    entity.object3D.position.set(x, 0, z);
                }, { once: true });
            }
        });
    },

    setMarkers: function (visiblePois) {
        this.pois = visiblePois || [];
        const visibleIds = new Set(this.pois.map(p => `poi-${p.name}`));

        this.entityPool.forEach((entity, id) => {
            if (entity.object3D) {
                const shouldBeVisible = visibleIds.has(id);

                if (entity.object3D.visible !== shouldBeVisible) {
                    entity.object3D.visible = shouldBeVisible;
                    entity.setAttribute('visible', shouldBeVisible);
                }
            }
        });
    },

    remove: function () {
        this.entityPool.forEach(entity => {
            if (entity.parentNode) {
                entity.parentNode.removeChild(entity);
            }
        });
        this.entityPool.clear();
        this.targetContainer = null;
    }
});
