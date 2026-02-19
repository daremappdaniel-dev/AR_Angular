import { AR_CONFIG } from '../ar-config';

AFRAME.registerSystem('route-system', {
    init: function () {
        this.camera = null;
        this.meshes = [];
        this.isStabilized = false;
        this.locarInstance = null;

        const locarEl = document.querySelector(AR_CONFIG.SYSTEM.LOCAR_CAMERA_SELECTOR);

        locarEl?.addEventListener('gps-initial-position-determined', () => {
            this.locarInstance = locarEl.components['locar-camera-custom']?.locar ?? null;
            this.isStabilized = true;
            this.meshes.forEach(mesh => {
                mesh.visible = true;
                mesh.scale.set(1, 1, 1);
            });
        });

        globalThis.addEventListener(AR_CONFIG.EVENTS.GPS_UPDATE, () => {
            if (this.locarInstance) {
                this.recalcularRutas();
            }
        });
    },

    recalcularRutas: function () {
        const segments = globalThis.__arRouteSegments ?? [];
        if (!segments.length) return;

        this.clearRoutes();

        segments.forEach(segment => {
            const startCoords = this.locarInstance.lonLatToWorldCoords(segment.start.lng, segment.start.lat);
            const endCoords = this.locarInstance.lonLatToWorldCoords(segment.end.lng, segment.end.lat);

            if (!startCoords || !endCoords) return;

            const start = new THREE.Vector3(startCoords[0], 0, startCoords[1]);
            const end = new THREE.Vector3(endCoords[0], 0, endCoords[1]);

            this.createRoute([start, end]);
        });
    },

    clearRoutes: function () {
        this.meshes.forEach(mesh => {
            this.el.sceneEl.object3D.remove(mesh);
            mesh.geometry?.dispose();
            mesh.material?.dispose();
        });
        this.meshes = [];
    },

    createRoute: function (coordinates) {
        if (!coordinates || coordinates.length < 2) return;

        const geometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(coordinates),
            coordinates.length * 10,
            0.5,
            3,
            false
        );

        const material = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            side: THREE.DoubleSide,
            depthWrite: false,
            transparent: true,
            opacity: 0.7
        });

        const mesh = new THREE.Mesh(geometry, material);
        this.el.sceneEl.object3D.add(mesh);
        this.registerRouteMesh(mesh);
    },

    registerRouteMesh: function (mesh) {
        this.meshes.push(mesh);
        if (!this.isStabilized) {
            mesh.visible = false;
            mesh.scale.set(0, 0, 0);
        }
    },

    tick: function () {
        if (!this.camera) {
            this.camera = this.el.sceneEl.camera;
        }

        if (this.camera && this.meshes.length > 0) {
            const camY = this.camera.position.y;
            this.meshes.forEach(mesh => {
                mesh.position.y = camY - AR_CONFIG.GPS.ELEVATION;
            });
        }
    }
});
