import { InjectionToken } from '@angular/core';

export interface ArQualitySettings {
    geometrySegments: number;
    textureQuality: 'low' | 'medium' | 'high';
    maxDistance: number;
    physicsUpdateRate: number;
}

import { AR_CONSTANTS } from '../constants/ar-settings.const';

export const AR_QUALITY_DEFAULTS: ArQualitySettings = {
    geometrySegments: AR_CONSTANTS.GEOMETRY.DEFAULT_SEGMENTS,
    textureQuality: AR_CONSTANTS.TEXTURES.QUALITY_MEDIUM,
    maxDistance: AR_CONSTANTS.RENDER.MAX_DISTANCE_METERS,
    physicsUpdateRate: AR_CONSTANTS.RENDER.PHYSICS_UPDATE_RATE_HZ
};

export const AR_QUALITY = new InjectionToken<ArQualitySettings>('AR_QUALITY', {
    providedIn: 'root',
    factory: () => AR_QUALITY_DEFAULTS
});
