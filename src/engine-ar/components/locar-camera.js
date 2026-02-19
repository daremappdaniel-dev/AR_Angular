import * as LocAR from 'locar';
import { AR_CONFIG } from '../ar-config';

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

        if (!camera) return;

        const gpsOptions = {
            gpsMinDistance: AR_CONFIG.GPS.MIN_DISTANCE,
            gpsMinAccuracy: AR_CONFIG.GPS.MIN_ACCURACY
        };

        this.locar = new LocAR.LocationBased(scene, camera, gpsOptions);
        this.locar.setElevation(AR_CONFIG.GPS.ELEVATION);
        this.el.components['locar-camera'].locar = this.locar;

        this.locar.on('gpsupdate', (event) => {
            globalThis.dispatchEvent(new CustomEvent(AR_CONFIG.EVENTS.GPS_UPDATE, {
                detail: { distMoved: event.distMoved, position: event.position }
            }));
        });

        const orientationOptions = {
            smoothingFactor: AR_CONFIG.ORIENTATION.SMOOTHING_FACTOR,
            orientationChangeThreshold: AR_CONFIG.ORIENTATION.CHANGE_THRESHOLD,
            enablePermissionDialog: AR_CONFIG.ORIENTATION.ENABLE_PERMISSION_DIALOG
        };

        this.orientationControls = new LocAR.DeviceOrientationControls(camera, orientationOptions);

        this.orientationControls.on('deviceorientationgranted', () => {
            this.orientationControls.connect();
        });

        this.orientationControls.init();
    },

    tick: function () {
        if (this.orientationControls) {
            this.orientationControls.update();
        }
    },

    remove: function () {
        if (this.orientationControls) {
            this.orientationControls.dispose();
        }
    },

    add: function (object, lon, lat) {
        if (this.locar) {
            this.locar.add(object, lon, lat);
        }
    }
});

