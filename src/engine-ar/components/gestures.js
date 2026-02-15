
AFRAME.registerComponent("gesture-detector", {
    schema: { element: { default: "" } },
    init: function () {
        this.targetElement = this.data.element && document.querySelector(this.data.element);
        if (!this.targetElement) {
            this.targetElement = this.el;
        }

        this.internalState = { previousState: null };
        this.emitGestureEvent = this.emitGestureEvent.bind(this);

        // BYPASS DE ZONA (Ya manejado por zone-flags.ts, usamos listener estándar)
        this.targetElement.addEventListener("touchstart", this.emitGestureEvent, { passive: true });
        this.targetElement.addEventListener("touchend", this.emitGestureEvent, { passive: true });
        this.targetElement.addEventListener("touchmove", this.emitGestureEvent, { passive: true });
    },
    remove: function () {
        this.targetElement.removeEventListener("touchstart", this.emitGestureEvent);
        this.targetElement.removeEventListener("touchend", this.emitGestureEvent);
        this.targetElement.removeEventListener("touchmove", this.emitGestureEvent);
    },
    emitGestureEvent(event) {
        const currentState = this.getTouchState(event);
        const previousState = this.internalState.previousState;
        const gestureContinues = previousState && currentState && currentState.touchCount == previousState.touchCount;
        const gestureEnded = previousState && !gestureContinues;
        const gestureStarted = currentState && !gestureContinues;

        if (gestureEnded) {
            this.el.emit("fingerend", previousState);
            this.internalState.previousState = null;
        }
        if (gestureStarted) {
            currentState.startTime = performance.now();
            currentState.startPosition = currentState.position;
            currentState.startSpread = currentState.spread;
            this.el.emit("fingerstart", currentState);
            this.internalState.previousState = currentState;
        }
        if (gestureContinues) {
            const eventDetail = {
                positionChange: {
                    x: currentState.position.x - previousState.position.x,
                    y: currentState.position.y - previousState.position.y
                }
            };
            if (currentState.spread) {
                eventDetail.spreadChange = currentState.spread - previousState.spread;
            }
            Object.assign(previousState, currentState);
            Object.assign(eventDetail, previousState);

            this.el.emit("fingermove", eventDetail);
        }
    },
    getTouchState: function (event) {
        if (event.touches.length === 0) return null;
        const touchList = Array.from(event.touches);
        const touchState = { touchCount: touchList.length };

        const centerPositionRawX = touchList.reduce((sum, touch) => sum + touch.clientX, 0) / touchList.length;
        const centerPositionRawY = touchList.reduce((sum, touch) => sum + touch.clientY, 0) / touchList.length;

        const screenScale = 2 / (window.innerWidth + window.innerHeight);
        touchState.position = { x: centerPositionRawX * screenScale, y: centerPositionRawY * screenScale };

        if (touchList.length >= 2) {
            const spread = touchList.reduce((sum, touch) => {
                return sum + Math.sqrt(Math.pow(centerPositionRawX - touch.clientX, 2) + Math.pow(centerPositionRawY - touch.clientY, 2));
            }, 0) / touchList.length;
            touchState.spread = spread * screenScale;
        }
        return touchState;
    }
});


AFRAME.registerComponent("gesture-handler", {
    schema: {
        enabled: { default: true },
        movementFactor: { default: 100 },
        lockY: { default: true },
        forceVisible: { default: false }
    },

    init: function () {
        this.handleDrag = this.handleDrag.bind(this);
        this.isVisible = this.data.forceVisible;

        this.el.sceneEl.addEventListener("markerFound", () => { this.isVisible = true; });
        this.el.sceneEl.addEventListener("markerLost", () => {
            if (!this.data.forceVisible) this.isVisible = false;
        });

        if (this.data.forceVisible) this.isVisible = true;
    },

    update: function () {
        if (this.data.forceVisible) this.isVisible = true;

        if (this.data.enabled) {
            this.el.sceneEl.addEventListener("fingermove", this.handleDrag);
            this.el.sceneEl.addEventListener("fingerstart", () => {
            });
            this.el.sceneEl.addEventListener("fingerend", () => {
            });
        } else {
            this.el.sceneEl.removeEventListener("fingermove", this.handleDrag);
        }
    },

    remove: function () {
        this.el.sceneEl.removeEventListener("fingermove", this.handleDrag);
    },

    handleDrag: function (event) {
        if (this.isVisible && event.detail.touchCount === 1) {
            const deltaX = event.detail.positionChange.x * this.data.movementFactor;
            const deltaZ = event.detail.positionChange.y * this.data.movementFactor;

            const currentPosition = this.el.object3D.position;
            currentPosition.x += deltaX;
            currentPosition.z += deltaZ;

            console.log(`[GestureHandler] Moving. Delta: [${deltaX.toFixed(4)}, ${deltaZ.toFixed(4)}]. NewPos: [${currentPosition.x.toFixed(2)}, ${currentPosition.z.toFixed(2)}]`);
        }
    }
});
