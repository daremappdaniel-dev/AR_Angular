import { Injectable, signal, OnDestroy, inject, NgZone } from '@angular/core';
import { GPS_ERROR_CODES } from '../../constants/ui-resources';
import { PermissionsService } from '../system/permissions.service';
import { GeoUtils } from '../../utils/geo-utils';

const GPS_UPDATE_EVENT = 'locar-gps-update';

@Injectable({
    providedIn: 'root'
})
export class GpsService implements OnDestroy {
    private readonly ngZone = inject(NgZone);
    private readonly permissionsService = inject(PermissionsService);

    readonly currentPosition = signal<{ lat: number, lng: number } | null>(null);
    readonly accuracy = signal<number>(Infinity);
    readonly distMoved = signal<number>(0);
    readonly error = signal<string | null>(null);

    private watchId: number | null = null;
    private readonly onGpsUpdate = (e: Event) => this.processGpsUpdate(e as CustomEvent);

    private lastValidPos: { lat: number; lng: number } | null = null;
    private lastUpdateTime: number = 0;

    constructor() {
        this.initGps();
        this.listenGpsUpdate();
    }

    private async initGps(): Promise<void> {
        const hasPermission = await this.permissionsService.checkGeolocationPermission();
        if (hasPermission) {
            this.watchPosition();
        }
    }

    private watchPosition(): void {
        if (!navigator.geolocation) {
            this.error.set(GPS_ERROR_CODES.UNSUPPORTED);
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    this.ngZone.run(() => this.accuracy.set(accuracy));

                    if (this.isSignalTooWeak(accuracy)) return;

                    const distance = this.calculateDistanceFromLast(latitude, longitude);
                    const timeElapsed = (Date.now() - this.lastUpdateTime) / 1000;

                    if (this.isSignificantMovement(distance, timeElapsed)) {
                        this.updateCurrentPosition(latitude, longitude, accuracy);
                    }
                },
                (err) => this.handleGpsError(err),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );
        });
    }

    private isSignalTooWeak(accuracy: number): boolean {
        return accuracy > 10;
    }

    private isSignificantMovement(distance: number, timeElapsed: number): boolean {
        if (!this.lastValidPos) return true;

        const isRealMovement = distance > 10;
        const isTimeRescue = timeElapsed > 30 && distance > 7;

        return isRealMovement || isTimeRescue;
    }

    private updateCurrentPosition(latitude: number, longitude: number, accuracy: number): void {
        this.ngZone.run(() => {
            this.currentPosition.set({ lat: latitude, lng: longitude });
            this.error.set(null);

            this.lastValidPos = { lat: latitude, lng: longitude };
            this.lastUpdateTime = Date.now();
        });
    }

    private handleGpsError(err: GeolocationPositionError): void {
        const errorMap: Record<number, string> = {
            [err.PERMISSION_DENIED]: GPS_ERROR_CODES.PERMISSION_DENIED,
            [err.POSITION_UNAVAILABLE]: GPS_ERROR_CODES.POSITION_UNAVAILABLE,
            [err.TIMEOUT]: GPS_ERROR_CODES.TIMEOUT,
        };
        this.ngZone.run(() => {
            this.error.set(errorMap[err.code] ?? GPS_ERROR_CODES.UNKNOWN);
        });
    }

    private listenGpsUpdate(): void {
        this.ngZone.runOutsideAngular(() => {
            globalThis.addEventListener(GPS_UPDATE_EVENT, this.onGpsUpdate);
        });
    }

    private processGpsUpdate(event: CustomEvent): void {
        this.ngZone.run(() => {
            this.distMoved.set(event.detail.distMoved);
        });
    }

    private calculateDistanceFromLast(lat: number, lng: number): number {
        if (!this.lastValidPos) return Infinity;
        return GeoUtils.haversine(
            this.lastValidPos.lat,
            this.lastValidPos.lng,
            lat,
            lng
        );
    }

    ngOnDestroy(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
        }
        globalThis.removeEventListener(GPS_UPDATE_EVENT, this.onGpsUpdate);
    }
}
