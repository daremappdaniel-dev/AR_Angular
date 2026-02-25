declare const AFRAME: any;
import * as LocAR from 'locar';
import { AR_CONFIG } from '../ar-config';

AFRAME.registerComponent('locar-camera-custom', {
    schema: {
        lat: { type: 'number', default: 0 },
        lng: { type: 'number', default: 0 },
        acc: { type: 'number', default: 0 }
    },

    update(this: any, oldData: any) {
        const { lat } = this.data;
        if (lat === 0) return;
        if (lat === oldData.lat) return;
        this._updateProjectionFactor(lat);
    },

    init(this: any) {
        const scene = this.el.sceneEl.object3D;
        const camera = this.el.getObject3D('camera');

        if (!camera) return;

        const gpsOptions = {
            gpsMinDistance: 0,
            gpsMinAccuracy: 999999
        };

        this.locar = new LocAR.LocationBased(scene, camera, gpsOptions);
        this.projectionFactor = 1.32;
        this.locar.setElevation(AR_CONFIG.GPS.ELEVATION * this.projectionFactor);
        this.el.components['locar-camera-custom'].locar = this.locar;
        this.el.components['locar-camera-custom'].projectionFactor = this.projectionFactor;



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

    tick(this: any) {
        if (this.orientationControls) {
            this.orientationControls.update();
        }
    },

    remove(this: any) {
        if (this.orientationControls) {
            this.orientationControls.dispose();
        }
    },


    _updateProjectionFactor(this: any, lat: number) {
        const factor = 1 / Math.cos(lat * Math.PI / 180);
        if (Math.abs(this.projectionFactor - factor) > 0.001) {
            this.projectionFactor = factor;
            this.el.components['locar-camera-custom'].projectionFactor = factor;
            if (this.locar) {
                this.locar.setElevation(AR_CONFIG.GPS.ELEVATION * factor);
            }
        }
    }
});

