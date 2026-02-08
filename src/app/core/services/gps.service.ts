import { Injectable, signal, OnDestroy, inject, NgZone } from '@angular/core';
import { GPS_ERROR_CODES } from '../constants/gps-errors.constants';

@Injectable({
    providedIn: 'root'
})
export class GpsService implements OnDestroy {
    private readonly ngZone = inject(NgZone);

    readonly currentPosition = signal<google.maps.LatLngLiteral | null>(null);
    readonly error = signal<string | null>(null);

    private watchId: number | null = null;

    constructor() {
        this.watchPosition();
    }

    private watchPosition() {
        if (!navigator.geolocation) {
            this.error.set(GPS_ERROR_CODES.UNSUPPORTED);
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    this.ngZone.run(() => {
                        this.currentPosition.set({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                        this.error.set(null);
                    });
                },
                (err) => {
                    this.ngZone.run(() => {
                        const errorMap: Record<number, string> = {
                            [err.PERMISSION_DENIED]: GPS_ERROR_CODES.PERMISSION_DENIED,
                            [err.POSITION_UNAVAILABLE]: GPS_ERROR_CODES.POSITION_UNAVAILABLE,
                            [err.TIMEOUT]: GPS_ERROR_CODES.TIMEOUT,
                        };

                        this.error.set(errorMap[err.code] ?? GPS_ERROR_CODES.UNKNOWN);
                    });
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );
        });
    }

    ngOnDestroy() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
        }
    }
}