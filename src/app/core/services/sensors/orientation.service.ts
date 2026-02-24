import { Injectable, NgZone, signal, OnDestroy, inject, computed } from '@angular/core';
import { PermissionsService } from '../system/permissions.service';

@Injectable({
    providedIn: 'root'
})
export class OrientationService implements OnDestroy {
    private readonly permissionsService = inject(PermissionsService);
    private readonly ngZone = inject(NgZone);

    private _currentHeading = 0;
    private readonly _headingSignal = signal<number>(0);
    public readonly heading = computed(() => this._headingSignal());

    private buffer: number[] = [];
    private readonly BUFFER_SIZE = 5;
    private readonly boundHandleOrientation = (event: DeviceOrientationEvent) => this.handleOrientation(event);
    private lastUiUpdate = 0;

    constructor() {
        this.initOrientation();
    }

    async requestPermission(): Promise<boolean> {
        return this.permissionsService.requestOrientationPermission();
    }

    private initOrientation() {
        this.ngZone.runOutsideAngular(() => {
            globalThis.addEventListener('deviceorientation', this.boundHandleOrientation, true);
        });
    }

    private handleOrientation(event: DeviceOrientationEvent) {
        const heading = this.extractHeading(event);
        if (heading === null) return;

        this.smoothHeading(heading);
        this.updateUiSignal();
    }

    private extractHeading(event: DeviceOrientationEvent): number | null {
        if ((event as any).webkitCompassHeading !== undefined) {
            return (event as any).webkitCompassHeading;
        }

        if (event.alpha !== null) {
            return 360 - event.alpha;
        }

        return null;
    }

    private smoothHeading(newHeading: number) {
        this.buffer.push(newHeading);
        if (this.buffer.length > this.BUFFER_SIZE) {
            this.buffer.shift();
        }

        let sinSum = 0;
        let cosSum = 0;

        for (const h of this.buffer) {
            const rad = h * Math.PI / 180;
            sinSum += Math.sin(rad);
            cosSum += Math.cos(rad);
        }

        const avgRad = Math.atan2(sinSum / this.buffer.length, cosSum / this.buffer.length);
        let avgDeg = avgRad * 180 / Math.PI;

        if (avgDeg < 0) avgDeg += 360;

        this._currentHeading = avgDeg;
    }

    private updateUiSignal() {
        const now = Date.now();
        if (now - this.lastUiUpdate < 1000) return;

        this.lastUiUpdate = now;
        this.ngZone.run(() => {
            this._headingSignal.set(Math.round(this._currentHeading));
        });
    }

    ngOnDestroy() {
        globalThis.removeEventListener('deviceorientation', this.boundHandleOrientation, true);
    }
}
