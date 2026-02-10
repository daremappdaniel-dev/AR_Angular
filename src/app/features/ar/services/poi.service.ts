import { Injectable, inject, computed, signal, effect } from '@angular/core';
import { GpsService } from '../../../core/services/sensors/gps.service';
import { GeoUtils } from '../../../core/utils/geo-utils';
import { DEFAULT_POIS } from '../../../shared/data/default-pois';
import { PointOfInterest } from '../../../shared/models/poi.model';
import { PoiView } from '../../../shared/models/poi-view.model';

@Injectable({ providedIn: 'root' })
export class PoiService {
    private readonly VISIBLE_RADIUS = 1000;
    private readonly gps = inject(GpsService);

    readonly poisResource = signal<PointOfInterest[]>(DEFAULT_POIS);

    readonly poisWithDistance = computed<PoiView[]>(() => {
        const userPos = this.gps.currentPosition();
        const currentPois = this.poisResource();

        if (!userPos) return [];

        return currentPois.map((poi, index) => {
            const distance = GeoUtils.haversine(userPos.lat, userPos.lng, poi.lat, poi.lng);
            return {
                ...poi,
                id: `poi-${index}`,
                label: poi.name,
                distance,
                isVisible: distance <= this.VISIBLE_RADIUS,
                screenPosition: { x: 0, y: 0 }
            };
        }).sort((a, b) => a.distance - b.distance);
    });

    readonly visiblePois = computed(() =>
        this.poisWithDistance().filter(poi => poi.isVisible)
    );

    constructor() {
        effect(() => {
            const pois = this.poisResource();
        });
    }
}
