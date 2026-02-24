import { Injectable, inject, computed, signal } from '@angular/core';
import { GpsService } from '../../../core/services/sensors/gps.service';
import { GeoUtils } from '../../../core/utils/geo-utils';
import { DEFAULT_POIS } from '../../../shared/data/default-pois';
import { PointOfInterest, PoiView } from '../../../shared/models/poi.model';
import { POI_CONFIG } from '../../../core/config/poi.config';

@Injectable({ providedIn: 'root' })
export class PoiService {
    private readonly config = inject(POI_CONFIG);
    private readonly VISIBLE_RADIUS = this.config.visibilityRadius;
    private readonly gps = inject(GpsService);

    readonly poisResource = signal<PointOfInterest[]>(DEFAULT_POIS);

    readonly poisWithDistance = computed<PoiView[]>(() => {
        const userPos = this.gps.currentPosition();
        const currentPois = this.poisResource();

        if (!userPos) return [];

        return currentPois.map((poi) => {
            const distance = GeoUtils.haversine(userPos.lat, userPos.lng, poi.lat, poi.lng);

            return {
                ...poi,
                id: `poi-${poi.name}`,
                label: poi.name,
                distance,
                isVisible: distance <= this.VISIBLE_RADIUS
            };
        }).sort((a, b) => a.distance - b.distance);
    });

    readonly visiblePois = computed(() =>
        this.poisWithDistance().filter(poi => poi.isVisible)
    );
}
