AFRAME.registerSystem('place-marker', {
    init: function () {
        this.markers = [];
        this.cameraEl = document.querySelector('[locar-camera]');
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
            this.cameraEl = document.querySelector('[locar-camera]');
            return;
        }

        const camObject = this.cameraEl.object3D;
        const camPos = camObject.position;

        this.markers.forEach(marker => {
            const object3D = marker.el.object3D;
            if (!object3D) return;

            const dist = object3D.position.distanceTo(camPos);

            const FADE_START = 500;
            const FADE_END = 1000;

            const scale = THREE.MathUtils.clamp(
                THREE.MathUtils.mapLinear(dist, FADE_START, FADE_END, 1, 0),
                0, 1
            );

            const BASE_SCALE = 5;
            const finalScale = BASE_SCALE * scale;
            object3D.visible = scale > 0.01;
            if (object3D.visible) {
                object3D.scale.set(finalScale, finalScale, finalScale);
            }

            const mesh = object3D.getObjectByProperty('type', 'Mesh');
            if (mesh && mesh.material) {
                mesh.material.opacity = scale;
                mesh.material.transparent = true;
                mesh.material.needsUpdate = true;
            }

            object3D.lookAt(camPos);
        });
    }
});

AFRAME.registerComponent('place-marker', {
    schema: {
        name: { type: 'string', default: 'Lugar Desconocido' },
        model: { type: 'asset' }
    },

    init: function () {
        const el = this.el;
        const modelUrl = this.data.model;

        if (modelUrl && (modelUrl.toLowerCase().endsWith('.glb') || modelUrl.toLowerCase().endsWith('.gltf'))) {
            el.setAttribute('gltf-model', modelUrl);
        } else {
            el.setAttribute('geometry', 'primitive: plane; width: 1; height: 1');
            el.setAttribute('material', {
                shader: 'flat',
                src: modelUrl,
                transparent: true,
                side: 'double'
            });
        }

        el.object3D.position.y = 1.6;
        this.system.registerMarker(this);
    },

    remove: function () {
        this.system.unregisterMarker(this);
    }
});