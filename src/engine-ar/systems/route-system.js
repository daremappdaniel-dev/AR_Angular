AFRAME.registerSystem('route-system', {
    init: function () {
        this.camera = null;
        this.mesh = null;
        this.isStabilized = false;

        this.targetGPS = null;
        this.currentGPS = null;
        this.lerpFactor = 0.05;
        this.minDistance = 5;

        globalThis.addEventListener('gps-initial-position-determined', () => {
            setTimeout(() => {
                this.isStabilized = true;
                if (this.mesh) {
                    this.mesh.visible = true;
                    this.mesh.scale.set(1, 1, 1);
                }
            }, 500);
        });
    },

    createRoute: function (coordinates) {
        if (!coordinates || coordinates.length < 2) return;

        const path = new THREE.CatmullRomCurve3(coordinates);
        const tubularSegments = coordinates.length * 10;
        const radius = 0.5;
        const radialSegments = 3;
        const closed = false;

        const geometry = new THREE.TubeGeometry(path, tubularSegments, radius, radialSegments, closed);

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
        this.mesh = mesh;
        if (!this.isStabilized) {
            this.mesh.visible = false;
            this.mesh.scale.set(0, 0, 0);
        }
    },

    updateTargetGPS: function (lat, lng) {
        if (!this.currentGPS) {
            this.currentGPS = { lat, lng };
            this.targetGPS = { lat, lng };
            this.applyGPS(lat, lng);
            return;
        }

        const R = 6371e3;
        const phi1 = this.targetGPS.lat * Math.PI / 180;
        const phi2 = lat * Math.PI / 180;
        const dPhi = (lat - this.targetGPS.lat) * Math.PI / 180;
        const dLambda = (lng - this.targetGPS.lng) * Math.PI / 180;

        const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance > this.minDistance) {
            this.targetGPS = { lat, lng };
        }
    },

    applyGPS: function (lat, lng) {
        const locar = document.querySelector('[locar-camera]')?.components['locar-camera']?.locar;
        if (locar) {
            locar.fakeGps(lng, lat);
        }
    },

    tick: function (t, dt) {
        if (!this.camera) {
            this.camera = this.el.sceneEl.camera;
        }

        if (this.camera && this.mesh) {
            this.mesh.position.y = this.camera.position.y - 1.6;
        }

        if (this.targetGPS && this.currentGPS) {
            const alpha = this.lerpFactor;

            const newLat = this.currentGPS.lat + (this.targetGPS.lat - this.currentGPS.lat) * alpha;
            const newLng = this.currentGPS.lng + (this.targetGPS.lng - this.currentGPS.lng) * alpha;

            this.currentGPS.lat = newLat;
            this.currentGPS.lng = newLng;

            this.applyGPS(newLat, newLng);
        }
    }
});
