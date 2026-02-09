import 'aframe';
import './engine-ar/utils/geo-utils.js';
import './engine-ar/components/place-marker.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// ACTIVAR MOCK GPS AQUI para desarrollo local (sin HTTPS)
const ENABLE_MOCK_GPS = true;

if (ENABLE_MOCK_GPS) {
    // Mock simple inline para evitar importar clases si no queremos
    console.warn('⚠️ MOCK GPS ACTIVADO');
    let lat = 40.99520; // 30m al sur del marcador (variable let para poder cambiarla)
    let lng = -5.719779;

    if (!navigator.geolocation) (navigator as any).geolocation = {};

    // Callback Store para notificar cambios
    let watchCallback: any = null;

    navigator.geolocation.getCurrentPosition = (success) => {
        success({ coords: { latitude: lat, longitude: lng, accuracy: 10 }, timestamp: Date.now() } as any);
    };

    navigator.geolocation.watchPosition = (success) => {
        watchCallback = success;
        setTimeout(() => success({ coords: { latitude: lat, longitude: lng, accuracy: 10 }, timestamp: Date.now() } as any), 100);
        return 1;
    };

    // EXPOSICIÓN GLOBAL PARA CONSOLA
    (window as any).teleport = (newLat: number, newLng: number) => {
        lat = newLat;
        lng = newLng;
        console.log(`🚀 Teletransportado a: ${lat}, ${lng}`);
        if (watchCallback) {
            watchCallback({ coords: { latitude: lat, longitude: lng, accuracy: 10 }, timestamp: Date.now() } as any);
        }
    };
}

bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));