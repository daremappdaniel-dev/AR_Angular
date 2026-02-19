declare const AFRAME: any;
import * as LocAR from 'locar';
import { AR_CONFIG } from '../ar-config';

AFRAME.registerComponent('locar-camera-custom', {
    schema: {
        simulate: { type: 'boolean', default: false },
        gpspos: { type: 'string', default: '' }
    },

    update(this: any, oldData: any) {
        if (this.data.gpspos && this.data.gpspos !== oldData.gpspos) {
            const coords = this.data.gpspos.split(',');
            if (coords.length === 4) {
                const lon = Number.parseFloat(coords[0]);
                const lat = Number.parseFloat(coords[1]);
                const acc = Number.parseFloat(coords[3]);

                if (!Number.isNaN(lon) && !Number.isNaN(lat) && !Number.isNaN(acc) && this.locar) {
                    console.warn(`[LocAR IN] Lat ${lat}, Lon ${lon}, Acc ${acc}m`);
                    this.locar.fakeGps(lon, lat, null, acc);
                }
            }
        }
    },

    init(this: any) {
        const scene = this.el.sceneEl.object3D;
        const camera = this.el.getObject3D('camera');

        if (!camera) return;

        const gpsOptions = {
            gpsMinDistance: AR_CONFIG.GPS.MIN_DISTANCE,
            gpsMinAccuracy: AR_CONFIG.GPS.MIN_ACCURACY
        };

        this.locar = new LocAR.LocationBased(scene, camera, gpsOptions);
        this.locar.setElevation(AR_CONFIG.GPS.ELEVATION);
        this.el.components['locar-camera-custom'].locar = this.locar;

        this.hasPosition = false;

        this.locar.on('gpsupdate', (event: any) => {
            console.warn(`[LocAR OUT] ACEPTADO Dist: ${event.distMoved.toFixed(2)}m`);

            if (!this.hasPosition) {
                this.el.emit('gps-initial-position-determined', event);
                this.hasPosition = true;
            }

            queueMicrotask(() => {
                globalThis.dispatchEvent(new CustomEvent(AR_CONFIG.EVENTS.GPS_UPDATE, {
                    detail: { distMoved: event.distMoved, position: event.position }
                }));
            });
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

    add(this: any, object: any, lon: number, lat: number) {
        if (this.locar) {
            this.locar.add(object, lon, lat);
        }
    }
});

