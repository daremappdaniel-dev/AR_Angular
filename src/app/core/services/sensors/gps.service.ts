import { Injectable, signal, OnDestroy, inject, NgZone } from '@angular/core';
import { GPS_ERROR_CODES } from '../../constants/ui-resources';
import { PermissionsService } from '../system/permissions.service';

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
                    this.ngZone.run(() => {
                        this.currentPosition.set({ lat: latitude, lng: longitude });
                        this.accuracy.set(accuracy);
                        this.error.set(null);
                    });
                },
                (err) => {
                    const errorMap: Record<number, string> = {
                        [err.PERMISSION_DENIED]: GPS_ERROR_CODES.PERMISSION_DENIED,
                        [err.POSITION_UNAVAILABLE]: GPS_ERROR_CODES.POSITION_UNAVAILABLE,
                        [err.TIMEOUT]: GPS_ERROR_CODES.TIMEOUT,
                    };
                    this.ngZone.run(() => {
                        this.error.set(errorMap[err.code] ?? GPS_ERROR_CODES.UNKNOWN);
                    });
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );
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

    ngOnDestroy(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
        }
        globalThis.removeEventListener(GPS_UPDATE_EVENT, this.onGpsUpdate);
    }
}
