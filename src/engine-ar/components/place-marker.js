import { AR_CONFIG } from '../ar-config';

AFRAME.registerSystem('place-marker', {
    init: function () {
        this.markers = [];
        this.cameraEl = null;
        this.lastSearch = 0;
        this.calculateFades = AFRAME.utils.throttleTick(this.updateDistancesAndFades, 150, this);
    },

    registerMarker: function (marker) {
        this.markers.push(marker);
    },

    unregisterMarker: function (marker) {
        const index = this.markers.indexOf(marker);
        if (index > -1) this.markers.splice(index, 1);
    },

    getCamera: function () {
        if (this.cameraEl) return this.cameraEl;

        const now = performance.now();
        if (now - this.lastSearch <= 500) return null;

        this.cameraEl = document.querySelector(AR_CONFIG.SYSTEM.LOCAR_CAMERA_SELECTOR);
        this.lastSearch = now;
        return this.cameraEl;
    },

    tick: function (t, dt) {
        const camera = this.getCamera();
        if (!camera) return;

        const camPos = camera.object3D.position;

        for (let i = 0; i < this.markers.length; i++) {
            const marker = this.markers[i];
            const object3D = marker.el.object3D;
            if (!object3D || !object3D.visible) continue;

            object3D.lookAt(camPos);
        }

        this.calculateFades(t, dt);
    },

    updateDistancesAndFades: function (t, dt) {
        const camera = this.getCamera();
        if (!camera) return;

        const camPos = camera.object3D.position;
        const cameraComponent = camera.components['locar-camera-custom'];
        const factor = cameraComponent?.projectionFactor || 1.32;

        const fadeStart = AR_CONFIG.FADE.START;
        const fadeEnd = AR_CONFIG.FADE.END;
        const baseScale = AR_CONFIG.FADE.BASE_SCALE * factor;

        for (let i = 0; i < this.markers.length; i++) {
            const marker = this.markers[i];
            const el = marker.el;
            const object3D = el.object3D;
            if (!object3D) continue;

            const dist = object3D.position.distanceTo(camPos);

            const scale = THREE.MathUtils.clamp(
                THREE.MathUtils.mapLinear(dist, fadeStart, fadeEnd, 1, 0),
                0, 1
            );

            if (scale <= 0.01) {
                if (object3D.visible) object3D.visible = false;
                continue;
            }

            if (!object3D.visible && el.getAttribute('visible') !== false) {
                object3D.visible = true;
            }

            const s = baseScale * scale;
            object3D.scale.set(s, s, s);

            if (marker.markerMesh?.material) {
                marker.markerMesh.material.opacity = scale;
            }
        }
    }
});

AFRAME.registerComponent('place-marker', {
    schema: {
        name: { type: 'string', default: AR_CONFIG.MARKER.DEFAULT_NAME },
        model: { type: 'asset' }
    },

    init: function () {
        this.markerMesh = null;
        const el = this.el;
        const modelUrl = this.data.model;
        const isGltf = modelUrl?.toLowerCase().endsWith('.glb') || modelUrl?.toLowerCase().endsWith('.gltf');

        if (isGltf) {
            el.setAttribute('gltf-model', modelUrl);
            el.addEventListener('model-loaded', () => {
                el.object3D.traverse((node) => {
                    if (!node.isMesh || this.markerMesh) return;
                    this.markerMesh = node;
                    this.markerMesh.material.transparent = true;
                });
            });
            return;
        }

        el.setAttribute('geometry', AR_CONFIG.MARKER.DEFAULT_GEOMETRY);
        el.setAttribute('material', {
            shader: 'flat',
            src: modelUrl,
            transparent: true,
            side: 'double'
        });
        this.markerMesh = el.getObject3D('mesh');

        const camera = document.querySelector(AR_CONFIG.SYSTEM.LOCAR_CAMERA_SELECTOR);
        const factor = camera?.components['locar-camera-custom']?.projectionFactor || 1.32;
        el.object3D.position.y = AR_CONFIG.MARKER.HEIGHT_OFFSET * factor;

        this.system.registerMarker(this);
    },

    remove: function () {
        this.system.unregisterMarker(this);
    }
});