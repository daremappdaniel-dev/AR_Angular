import { AR_CONFIG } from '../ar-config';

AFRAME.registerSystem('stability', {
    init: function () {
        this.isStable = false;
        this.cameraEl = document.querySelector(AR_CONFIG.SYSTEM.LOOK_AT_TARGET);
    },

    tick: function () {
        if (this.isStable || !this.cameraEl) return;

        this.checkStability();
    },

    checkStability: function () {
        const y = this.cameraEl.object3D.position.y;
        const accuracy = this.getGpsAccuracy();

        if (y > AR_CONFIG.STABILITY.Y_MIN && accuracy < AR_CONFIG.STABILITY.ACCURACY_MAX) {
            this.isStable = true;
            this.el.emit('ar-stable');
        }
    },

    getGpsAccuracy: function () {
        return globalThis.lastGpsAccuracy || 999;
    }
});
