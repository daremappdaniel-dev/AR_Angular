declare const AFRAME: any;
import * as LocAR from 'locar';
import { AR_CONFIG } from '../ar-config';

AFRAME.registerComponent('locar-camera-custom', {
    init(this: any) {
        const scene = this.el.sceneEl.object3D;
        const camera = this.el.getObject3D('camera');

        if (!camera) return;

        const gpsOptions = {
            gpsMinDistance: 7,
            gpsMinAccuracy: 10
        };

        this.locar = new LocAR.LocationBased(scene, camera, gpsOptions);
        this.locar.setElevation(AR_CONFIG.GPS.ELEVATION);
        this.el.components['locar-camera-custom'].locar = this.locar;
        this.locar.startGps();

        this.hasPosition = false;

        this.locar.on('gpsupdate', (event: any) => {
            const latFilt = event.position?.coords?.latitude ?? 'N/A';
            const lonFilt = event.position?.coords?.longitude ?? 'N/A';

            console.warn(`[LocAR OUT] ACEPTADO Dist: ${event.distMoved.toFixed(2)}m (Rebote si >20m en instantes) | Lat ${latFilt}, Lon ${lonFilt}`);

            document.querySelectorAll('[place-marker]').forEach((marker: any) => {
                console.log(`[LocAR 3D DISTANCIA] A "${marker.id}": ${marker.object3D?.position.distanceTo(camera.position).toFixed(1)}m`);
            });

            if (!this.hasPosition) {
                this.el.emit('gps-initial-position-determined', event);
                this.hasPosition = true;
            }

            queueMicrotask(() => {
                globalThis.dispatchEvent(new CustomEvent(AR_CONFIG.EVENTS.GPS_UPDATE, {
                    detail: {
                        distMoved: event.distMoved,
                        lat: event.position.coords.latitude,
                        lng: event.position.coords.longitude,
                        accuracy: event.position.coords.accuracy
                    }
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

