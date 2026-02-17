import { InjectionToken } from '@angular/core';

export interface PoiConfig {
    visibilityRadius: number;
    defaultModel: string;
    simulation: {
        defaultAccuracy: number;
        highAccuracy: { value: number; delay: number };
        lowAccuracy: { value: number; delay: number };
    };
}

import { AR_CONSTANTS } from '../constants/ar-settings.const';

export const POI_CONFIG_DEFAULTS: PoiConfig = {
    visibilityRadius: AR_CONSTANTS.POI.VISIBILITY_RADIUS_METERS,
    defaultModel: AR_CONSTANTS.POI.DEFAULT_MODEL_URL,
    simulation: {
        defaultAccuracy: AR_CONSTANTS.GPS_SIMULATION.DEFAULT_ACCURACY_METERS,
        highAccuracy: {
            value: AR_CONSTANTS.GPS_SIMULATION.HIGH_ACCURACY.VALUE,
            delay: AR_CONSTANTS.GPS_SIMULATION.HIGH_ACCURACY.DELAY_MS
        },
        lowAccuracy: {
            value: AR_CONSTANTS.GPS_SIMULATION.LOW_ACCURACY.VALUE,
            delay: AR_CONSTANTS.GPS_SIMULATION.LOW_ACCURACY.DELAY_MS
        }
    }
};

export const POI_CONFIG = new InjectionToken<PoiConfig>('poi.config', {
    providedIn: 'root',
    factory: () => POI_CONFIG_DEFAULTS
});
