import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {

    async requestOrientationPermission(): Promise<boolean> {
        const requestPermission = (DeviceOrientationEvent as any).requestPermission;
        if (!requestPermission) return true;

        const status = await requestPermission();
        if (status !== 'granted') throw new Error('NotAllowedError');

        return true;
    }

    async requestCameraPermission(): Promise<boolean> {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        stream.getTracks().forEach(track => track.stop());
        return true;
    }

    async checkGeolocationPermission(): Promise<boolean> {
        if (!navigator.geolocation) throw new Error('GPS_UNAVAILABLE');

        return new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(
                () => resolve(true),
                reject,
                { enableHighAccuracy: true, timeout: 5000 }
            )
        );
    }
}
