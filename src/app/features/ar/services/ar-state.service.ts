import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArStateService {
    readonly isStabilized = signal(false);
    readonly cameraHeight = signal(0);
    readonly gpsAccuracy = signal(0);

    setStabilized(value: boolean): void {
        this.isStabilized.set(value);
    }

    updateCameraHeight(height: number): void {
        this.cameraHeight.set(height);
    }

    updateGpsAccuracy(accuracy: number): void {
        this.gpsAccuracy.set(accuracy);
    }
}
