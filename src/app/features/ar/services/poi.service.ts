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

        const userProjected = GeoUtils.sphMercProject(userPos.lng, userPos.lat);

        return currentPois.map((poi) => {
            const distance = GeoUtils.haversine(userPos.lat, userPos.lng, poi.lat, poi.lng);
            const poiProjected = GeoUtils.sphMercProject(poi.lng, poi.lat);

            return {
                ...poi,
                id: `poi-${poi.name}`,
                label: poi.name,
                distance,
                isVisible: distance <= this.VISIBLE_RADIUS,
                worldX: poiProjected[0] - userProjected[0],
                worldZ: -(poiProjected[1] - userProjected[1])
            };
        }).sort((a, b) => a.distance - b.distance);
    });

    readonly visiblePois = computed(() =>
        this.poisWithDistance().filter(poi => poi.isVisible)
    );
}
