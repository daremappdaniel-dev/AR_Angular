import { InjectionToken } from '@angular/core';

export interface ArQualitySettings {
    textureQuality: 'low' | 'medium' | 'high';
    maxDistance: number;
    physicsUpdateRate: number;
}

export const AR_QUALITY_DEFAULTS: ArQualitySettings = {
    textureQuality: 'medium',
    maxDistance: 50,
    physicsUpdateRate: 60
};

export const AR_QUALITY = new InjectionToken<ArQualitySettings>('AR_QUALITY', {
    providedIn: 'root',
    factory: () => AR_QUALITY_DEFAULTS
});
