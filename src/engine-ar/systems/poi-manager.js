import { AR_CONFIG } from '../ar-config';

const HIDDEN_Y = -99999;
const MAX_POIS = 256;

AFRAME.registerSystem('poi-manager', {
    init: function () {
        this.pois = [];
        this.poiIndexMap = new Map();
        this._buildPointCloud();
    },

    _buildPointCloud: function () {
        const geometry = new THREE.BufferGeometry();

        this.positions = new Float32Array(MAX_POIS * 3);
        for (let i = 0; i < MAX_POIS; i++) {
            this.positions[i * 3 + 1] = HIDDEN_Y;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        geometry.drawRange = { start: 0, count: 0 };

        const texture = new THREE.TextureLoader().load(AR_CONFIG.POI.ALPHA_TEXTURE);

        const material = new THREE.PointsMaterial({
            map: texture,
            size: AR_CONFIG.MARKER.POINT_SIZE,
            sizeAttenuation: true,
            transparent: true,
            alphaTest: 0.1,
            depthWrite: false
        });

        this.points = new THREE.Points(geometry, material);
        this.points.frustumCulled = false;
        this.el.object3D.add(this.points);
    },

    initializeEntities: function (allPois) {
        this.poiIndexMap.clear();
        allPois.forEach((poi, index) => {
            this.poiIndexMap.set(`poi-${poi.name}`, index);
        });
        this.points.geometry.drawRange.count = allPois.length;
        this.points.geometry.attributes.position.needsUpdate = true;
    },

    setMarkers: function (pois) {
        this.pois = pois;
        this._applyPositions();
    },

    _applyPositions: function () {
        const visibleIds = new Set(this.pois.map(poi => poi.id));
        const elevation = AR_CONFIG.GPS.ELEVATION;

        this.poiIndexMap.forEach((index, id) => {
            const base = index * 3;
            const poi = this.pois.find(p => p.id === id);

            if (poi && visibleIds.has(id)) {
                this.positions[base] = poi.worldX;
                this.positions[base + 1] = elevation;
                this.positions[base + 2] = poi.worldZ;
            } else {
                this.positions[base] = 0;
                this.positions[base + 1] = HIDDEN_Y;
                this.positions[base + 2] = 0;
            }
        });

        this.points.geometry.attributes.position.needsUpdate = true;
    }
});
