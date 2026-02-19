import { AR_CONFIG } from '../ar-config';

AFRAME.registerSystem('place-marker', {
    init: function () {
        this.markers = [];
        this.cameraEl = null;
    },

    registerMarker: function (marker) {
        this.markers.push(marker);
    },

    unregisterMarker: function (marker) {
        const index = this.markers.indexOf(marker);
        if (index > -1) this.markers.splice(index, 1);
    },

    tick: function () {
        if (!this.cameraEl) {
            this.cameraEl = document.querySelector(AR_CONFIG.SYSTEM.LOCAR_CAMERA_SELECTOR);
            if (!this.cameraEl) return;
        }

        const camPos = this.cameraEl.object3D.position;
        const fadeStart = AR_CONFIG.FADE.START;
        const fadeEnd = AR_CONFIG.FADE.END;
        const baseScale = AR_CONFIG.FADE.BASE_SCALE;

        for (const marker of this.markers) {
            const object3D = marker.el.object3D;
            if (!object3D || !object3D.visible) continue;

            const dist = object3D.position.distanceTo(camPos);
            const scale = THREE.MathUtils.clamp(
                THREE.MathUtils.mapLinear(dist, fadeStart, fadeEnd, 1, 0),
                0, 1
            );

            if (scale <= 0.01) {
                object3D.visible = false;
                continue;
            }

            const s = baseScale * scale;
            object3D.scale.set(s, s, s);
            object3D.lookAt(camPos);

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
                    if (node.isMesh && !this.markerMesh) {
                        this.markerMesh = node;
                        this.markerMesh.material.transparent = true;
                    }
                });
            });
        } else {
            el.setAttribute('geometry', AR_CONFIG.MARKER.DEFAULT_GEOMETRY);
            el.setAttribute('material', {
                shader: 'flat',
                src: modelUrl,
                transparent: true,
                side: 'double'
            });
            this.markerMesh = el.getObject3D('mesh');
        }

        el.object3D.position.y = AR_CONFIG.MARKER.HEIGHT_OFFSET;
        this.system.registerMarker(this);
    },

    remove: function () {
        this.system.unregisterMarker(this);
    }
});