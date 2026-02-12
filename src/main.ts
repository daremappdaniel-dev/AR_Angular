import 'aframe';
import 'locar';
import 'locar-aframe';

import './engine-ar/components/place-marker.js';
import './engine-ar/components/occluder-component.js';
import './engine-ar/systems/route-system.js';
import './engine-ar/systems/stability-system.js';
import './engine-ar/systems/poi-manager.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const ENABLE_MOCK_GPS = false;

if (ENABLE_MOCK_GPS) {
    let lat = 40.9952;
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

    (globalThis as any).teleport = (newLat: number, newLng: number) => {
        lat = newLat;
        lng = newLng;
        if (watchCallback) {
            watchCallback({ coords: { latitude: lat, longitude: lng, accuracy: 10 }, timestamp: Date.now() } as any);
        }
    };
}

await bootstrapApplication(AppComponent, appConfig);