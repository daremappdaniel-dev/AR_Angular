import { InjectionToken } from '@angular/core';

export interface PoiConfig {
    visibilityRadius: number;
    defaultModel: string;
    points: {
        north: { name: string; lat: number; lng: number };
        south: { name: string; lat: number; lng: number };
    }
}

export const POI_CONFIG_DEFAULTS: PoiConfig = {
    visibilityRadius: 50,
    defaultModel: '',
    points: {
        north: {
            name: 'Punto Norte',
            lat: 40.99546,
            lng: -5.719779
        },
        south: {
            name: 'Punto Sur',
            lat: 40.99502,
            lng: -5.719779
        }
    }
};

export const POI_CONFIG = new InjectionToken<PoiConfig>('poi.config', {
    providedIn: 'root',
    factory: () => POI_CONFIG_DEFAULTS
});
