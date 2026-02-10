import * as LocAR from 'locar';

AFRAME.registerComponent('locar-camera', {
    schema: {
        simulate: { type: 'boolean', default: false }
    },

    init: function () {
        const scene = this.el.sceneEl.object3D;
        const camera = this.el.getObject3D('camera');

        if (!camera) {
            console.error('[LocAR] Camera not found on element');
            return;
        }

        this.locar = new LocAR.LocationBased(scene, camera);

        this.el.components['locar-camera'].locar = this.locar;
        console.log('[LocAR] Sistema nativo inicializado');


    },

    tick: function () {
    },

    add: function (object, lon, lat) {
        if (this.locar) {
            this.locar.add(object, lon, lat);
        }
    },

    updateGps: function (lon, lat) {
        if (this.data.simulate && this.locar) {
            this.locar.fakeGps(lon, lat);
        }
    }
});
