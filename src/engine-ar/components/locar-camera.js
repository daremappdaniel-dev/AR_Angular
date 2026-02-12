import * as LocAR from 'locar';

AFRAME.registerComponent('locar-camera', {
    schema: {
        simulate: { type: 'boolean', default: false },
        gpsPos: { type: 'string', default: '' }
    },

    update: function (oldData) {
        if (this.data.gpsPos && this.data.gpsPos !== oldData.gpsPos) {
            const coords = this.data.gpsPos.split(',');
            if (coords.length === 2) {
                const lon = Number.parseFloat(coords[0]);
                const lat = Number.parseFloat(coords[1]);
                if (!Number.isNaN(lon) && !Number.isNaN(lat) && this.locar) {
                    this.locar.fakeGps(lon, lat);
                }
            }
        }
    },

    init: function () {
        const scene = this.el.sceneEl.object3D;
        const camera = this.el.getObject3D('camera');

        if (!camera) {
            return;
        }

        this.locar = new LocAR.LocationBased(scene, camera);

        this.el.components['locar-camera'].locar = this.locar;


    },

    add: function (object, lon, lat) {
        if (this.locar) {
            this.locar.add(object, lon, lat);
        }
    }
});
