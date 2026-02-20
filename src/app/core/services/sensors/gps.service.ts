import { Injectable, signal, OnDestroy, inject, NgZone } from '@angular/core';
import { GPS_ERROR_CODES } from '../../constants/gps-errors.constants';

@Injectable({
    providedIn: 'root'
})
export class GpsService implements OnDestroy {
    private readonly ngZone = inject(NgZone);

    readonly currentPosition = signal<{ lat: number, lng: number } | null>(null);
    readonly accuracy = signal<number>(Infinity);
    readonly error = signal<string | null>(null);

    private watchId: number | null = null;

    constructor() {
        this.watchPosition();

        (globalThis as any).teleport = (newLat: number, newLng: number) => {
            this.updateLocAR(newLat, newLng);

            this.currentPosition.set({
                lat: newLat,
                lng: newLng
            });
            this.accuracy.set(0);
            (globalThis as any).lastGpsAccuracy = 0;
            this.error.set(null);
        };
    }

    private updateLocAR(lat: number, lng: number) {
        const locarElement = document.querySelector('[locar-camera]') as unknown as any;
        const locarComponent = locarElement?.components?.['locar-camera'];

        if (locarComponent?.locar) {
            locarComponent.locar.fakeGps(lng, lat);
        }
    }

    private watchPosition() {
        if (!navigator.geolocation) {
            this.error.set(GPS_ERROR_CODES.UNSUPPORTED);
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;

                    this.currentPosition.set({
                        lat: latitude,
                        lng: longitude
                    });
                    this.accuracy.set(accuracy);
                    (globalThis as any).lastGpsAccuracy = accuracy;
                    this.error.set(null);
                },
                (err) => {
                    const errorMap: Record<number, string> = {
                        [err.PERMISSION_DENIED]: GPS_ERROR_CODES.PERMISSION_DENIED,
                        [err.POSITION_UNAVAILABLE]: GPS_ERROR_CODES.POSITION_UNAVAILABLE,
                        [err.TIMEOUT]: GPS_ERROR_CODES.TIMEOUT,
                    };

                    this.error.set(errorMap[err.code] ?? GPS_ERROR_CODES.UNKNOWN);
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