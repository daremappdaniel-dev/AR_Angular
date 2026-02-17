
export const ModelOpacityUtils = {

    setDeepOpacity: function (entity, opacity) {
        if (!entity || !entity.object3D) return;

        entity.object3D.traverse((node) => {
            if (node.isMesh) {

                const isTransparent = opacity < 1.0;

                if (Array.isArray(node.material)) {
                    node.material.forEach(mat => this._applyMaterialOpacity(mat, opacity, isTransparent));
                } else {
                    this._applyMaterialOpacity(node.material, opacity, isTransparent);
                }
            }
        });
    },

    _applyMaterialOpacity: function (material, opacity, isTransparent) {
        material.transparent = isTransparent;
        material.opacity = opacity;

        material.depthWrite = !isTransparent;

        material.needsUpdate = true;
    }
};
