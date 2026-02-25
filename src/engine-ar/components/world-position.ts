declare const AFRAME: any;
import { AR_CONFIG } from '../ar-config';

AFRAME.registerComponent('world-position', {
    schema: {
        x: { type: 'number', default: 0 },
        z: { type: 'number', default: 0 }
    },

    update(this: any) {
        const camera = document.querySelector(AR_CONFIG.SYSTEM.LOCAR_CAMERA_SELECTOR) as any;
        const factor = camera?.components?.['locar-camera-custom']?.projectionFactor ?? 1.32;
        const elevation = AR_CONFIG.GPS.ELEVATION * factor;
        this.el.object3D.position.set(this.data.x, elevation, this.data.z);
    }
});
