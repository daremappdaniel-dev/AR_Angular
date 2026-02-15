AFRAME.registerSystem('route-system', {
    init: function () {
        this.camera = null;
        this.meshes = [];
        this.isStabilized = false;

        globalThis.addEventListener('gps-initial-position-determined', () => {
            setTimeout(() => {
                this.isStabilized = true;
                this.meshes.forEach(mesh => {
                    mesh.visible = true;
                    mesh.scale.set(1, 1, 1);
                });
            }, 500);
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

        const worldRootEl = document.querySelector('#ar-world-root');

        if (worldRootEl && worldRootEl.object3D) {
            worldRootEl.object3D.add(mesh);
        } else {
            this.el.sceneEl.object3D.add(mesh);
        }

        this.registerRouteMesh(mesh);
    },

    registerRouteMesh: function (mesh) {
        this.meshes.push(mesh);
        if (!this.isStabilized) {
            mesh.visible = false;
            mesh.scale.set(0, 0, 0);
        }
    },

    tick: function (t, dt) {
        if (!this.camera) {
            this.camera = this.el.sceneEl.camera;
        }

        if (this.camera && this.meshes.length > 0) {
            this.meshes.forEach(mesh => {
                mesh.position.y = this.camera.position.y - 1.6;
            });
        }
    }
});
