import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArStateService {
    readonly isStabilized = signal(false);
    readonly cameraHeight = signal(0);
    readonly gpsAccuracy = signal(0);

    private readonly _calibrationOffset = signal({ x: 0, z: 0 });
    readonly calibrationOffset = this._calibrationOffset.asReadonly();

    setStabilized(value: boolean): void {
        this.isStabilized.set(value);
    }

    updateCameraHeight(height: number): void {
        this.cameraHeight.set(height);
    }

    updateGpsAccuracy(accuracy: number): void {
        this.gpsAccuracy.set(accuracy);
    }

    moveCalibration(dx: number, dz: number): void {
        this._calibrationOffset.update(current => {
            const next = {
                x: current.x + dx,
                z: current.z + dz
            };
            console.log(`[AR-STATE] 💾 Nuevo Offset Guardado: X=${next.x}, Z=${next.z}`);
            return next;
        });
    }

    resetCalibration(): void {
        this._calibrationOffset.set({ x: 0, z: 0 });
    }
}
