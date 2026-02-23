import { AR_CONFIG } from '../ar-config';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

AFRAME.registerSystem('route-system', {
    init: function () {
        this.camera = null;
        this.isStabilized = false;
        this.locarInstance = null;
        console.log('[ROUTE-SYSTEM] Inicializando motor Fat Lines...');

        this.lineGeometry = new LineGeometry();
        this.lineMaterial = new LineMaterial({
            color: 0x3b82f6,
            linewidth: 6,
            transparent: true,
            opacity: 0.8,
            dashed: false,
            depthWrite: false,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });

        this.fatLine = new Line2(this.lineGeometry, this.lineMaterial);
        this.fatLine.frustumCulled = false;

        this.fatLine.visible = false;

        this.el.sceneEl.object3D.add(this.fatLine);
        this.onResize = () => {
            if (this.lineMaterial) {
                this.lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', this.onResize);

        const locarEl = document.querySelector(AR_CONFIG.SYSTEM.LOCAR_CAMERA_SELECTOR);
        locarEl?.addEventListener('gps-initial-position-determined', () => {
            this.locarInstance = locarEl.components['locar-camera-custom']?.locar ?? null;
            this.isStabilized = true;
            this.fatLine.visible = true;
            this.recalcularRutas();
        });

        globalThis.addEventListener(AR_CONFIG.EVENTS.GPS_UPDATE, () => {
            if (this.locarInstance && this.isStabilized) {
                this.recalcularRutas();
            }
        });
    },

    recalcularRutas: function () {
        const segments = globalThis.__arRouteSegments ?? [];
        console.log(`[ROUTE-SYSTEM] Recalculando con ${segments.length} segmentos.`);
        if (!segments || !this.locarInstance) return;

        const pathPoints = [];

        segments.forEach((segment, index) => {
            const startCoords = this.locarInstance.lonLatToWorldCoords(segment.start.lng, segment.start.lat);
            if (index === 0) {
                pathPoints.push(new THREE.Vector3(startCoords[0], -AR_CONFIG.GPS.ELEVATION, startCoords[1]));
            }

            const endCoords = this.locarInstance.lonLatToWorldCoords(segment.end.lng, segment.end.lat);
            pathPoints.push(new THREE.Vector3(endCoords[0], -AR_CONFIG.GPS.ELEVATION, endCoords[1]));
        });

        if (pathPoints.length < 2) return;

        const curve = new THREE.CatmullRomCurve3(pathPoints);
        const smoothPointsCount = Math.max(pathPoints.length * 10, 20);
        const smoothPoints = curve.getPoints(smoothPointsCount);

        const positions = [];
        smoothPoints.forEach(p => {
            positions.push(p.x, p.y, p.z);
        });

        console.log(`[ROUTE-SYSTEM] Inyectando ${smoothPoints.length} puntos en el Buffer.`);
        this.lineGeometry.setPositions(positions);
    },

    remove: function () {
        window.removeEventListener('resize', this.onResize);

        if (this.fatLine && this.fatLine.parent) {
            this.fatLine.parent.remove(this.fatLine);
        }

        if (this.lineGeometry) this.lineGeometry.dispose();
        if (this.lineMaterial) this.lineMaterial.dispose();
    }
});
