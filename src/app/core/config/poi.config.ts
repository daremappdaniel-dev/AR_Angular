import { InjectionToken } from '@angular/core';

export interface PoiConfig {
    visibilityRadius: number;
    defaultModel: string;
}

export const POI_CONFIG_DEFAULTS: PoiConfig = {
    visibilityRadius: 50,
    defaultModel: '',
};

export const POI_CONFIG = new InjectionToken<PoiConfig>('poi.config', {
    providedIn: 'root',
    factory: () => POI_CONFIG_DEFAULTS
});
