import * as LocAR from 'locar';

AFRAME.registerComponent('locar-camera', {
    schema: {
        simulate: { type: 'boolean', default: false }
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

    tick: function () {
    },

    add: function (object, lon, lat) {
        if (this.locar) {
            this.locar.add(object, lon, lat);
        }
    },

    updateGps: function (lon, lat) {

    }
});
