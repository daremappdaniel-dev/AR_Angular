import { AR_CONFIG } from '../ar-config';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

AFRAME.registerSystem('route-system', {
    init: function () {
        this.isStabilized = false;
        this.locarInstance = null;
        console.log('[ROUTE-SYSTEM] Inicializando motor Fat Lines...');

        this.lineMaterial = new LineMaterial({
            color: 0x3b82f6,
            linewidth: 6,
            transparent: true,
            opacity: 0.8,
            dashed: false,
            depthWrite: false,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });

        this.lineGeometry = new LineGeometry();
        this.fatLine = new Line2(this.lineGeometry, this.lineMaterial);
        this.fatLine.frustumCulled = false;
        this.fatLine.visible = false;

        this.el.sceneEl.object3D.add(this.fatLine);

        this.onResize = () => {
            if (this.lineMaterial) {
                this.lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
            }
        };
        this.onGpsUpdate = this.handleGpsUpdate.bind(this);
        this.onLocarReady = this.handleLocarReady.bind(this);

        window.addEventListener('resize', this.onResize);
        globalThis.addEventListener(AR_CONFIG.EVENTS.GPS_UPDATE, this.onGpsUpdate);

        this.el.sceneEl.addEventListener('gps-initial-position-determined', this.onLocarReady);
    },

    handleLocarReady: function (event) {
        const locarEl = document.querySelector(AR_CONFIG.SYSTEM.LOCAR_CAMERA_SELECTOR);
        if (!locarEl) return;

        this.locarInstance = locarEl.components['locar-camera-custom']?.locar ?? null;
        this.isStabilized = true;
        this.fatLine.visible = true;
        this.recalcularRutas();
    },

    handleGpsUpdate: function () {
        if (this.locarInstance && this.isStabilized) {
            this.recalcularRutas();
        }
    },

    recalcularRutas: function () {
        const segments = globalThis.__arRouteSegments ?? [];
        if (!segments.length || !this.locarInstance) return;

        console.log('[ROUTE] Recalculando ruta: ' + segments.length + ' segmentos.');
        const pathPoints = [];
        const ROUTE_HEIGHT = 1.2;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const startCoords = this.locarInstance.lonLatToWorldCoords(segment.start.lng, segment.start.lat);

            if (i === 0) {
                pathPoints.push(new THREE.Vector3(startCoords[0], ROUTE_HEIGHT, startCoords[1]));
            }

            const endCoords = this.locarInstance.lonLatToWorldCoords(segment.end.lng, segment.end.lat);
            pathPoints.push(new THREE.Vector3(endCoords[0], ROUTE_HEIGHT, endCoords[1]));
        }

        if (pathPoints.length < 2) return;

        const curve = new THREE.CatmullRomCurve3(pathPoints);
        const smoothPointsCount = Math.max(pathPoints.length * 10, 20);
        const smoothPoints = curve.getPoints(smoothPointsCount);

        const positions = [];
        for (let j = 0; j < smoothPoints.length; j++) {
            positions.push(smoothPoints[j].x, smoothPoints[j].y, smoothPoints[j].z);
        }

        console.log(`[GPU] Inyectando ${smoothPoints.length} vértices en el Buffer de la ruta.`);
        this.lineGeometry.setPositions(positions);
    },

    remove: function () {
        window.removeEventListener('resize', this.onResize);
        globalThis.removeEventListener(AR_CONFIG.EVENTS.GPS_UPDATE, this.onGpsUpdate);
        this.el.sceneEl.removeEventListener('gps-initial-position-determined', this.onLocarReady);

        if (this.fatLine && this.fatLine.parent) {
            this.fatLine.parent.remove(this.fatLine);
        }

        if (this.lineGeometry) this.lineGeometry.dispose();
        if (this.lineMaterial) this.lineMaterial.dispose();
    }
});
