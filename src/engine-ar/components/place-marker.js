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
        const camPos = this.cameraEl.object3D.position;

        this.markers.forEach(marker => {
            const dist = marker.el.object3D.position.distanceTo(camPos);

            if (dist < 1000) {
                marker.onNear();
            } else {
                marker.onFar();
            }

            marker.el.object3D.lookAt(camPos);
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

        el.setAttribute('look-at', '[camera]');
        el.object3D.position.y = 1.6;
        this.system.registerMarker(this);
    },

    onNear: function () {
        if (!this.isNear) {
            this.el.setAttribute('scale', '15 15 15');
            this.el.setAttribute('visible', true);
            this.isNear = true;
        }
    },

    onFar: function () {
        if (this.isNear) {
            this.el.setAttribute('scale', '0 0 0');
            this.el.setAttribute('visible', false);
            this.isNear = false;
        }
    },

    remove: function () {
        this.system.unregisterMarker(this);
    }
});