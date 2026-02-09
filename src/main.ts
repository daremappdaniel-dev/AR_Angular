import 'aframe';

import './engine-ar/components/place-marker.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const ENABLE_MOCK_GPS = true;

if (ENABLE_MOCK_GPS) {
    let lat = 40.99520;
    let lng = -5.719779;

    if (!navigator.geolocation) (navigator as any).geolocation = {};

    let watchCallback: any = null;

    navigator.geolocation.getCurrentPosition = (success) => {
        success({ coords: { latitude: lat, longitude: lng, accuracy: 10 }, timestamp: Date.now() } as any);
    };

    navigator.geolocation.watchPosition = (success) => {
        watchCallback = success;
        setTimeout(() => success({ coords: { latitude: lat, longitude: lng, accuracy: 10 }, timestamp: Date.now() } as any), 100);
        return 1;
    };

    (window as any).teleport = (newLat: number, newLng: number) => {
        lat = newLat;
        lng = newLng;
        if (watchCallback) {
            watchCallback({ coords: { latitude: lat, longitude: lng, accuracy: 10 }, timestamp: Date.now() } as any);
        }
    };
}

bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));