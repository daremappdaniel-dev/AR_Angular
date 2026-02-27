import { Injectable, inject, computed, signal } from '@angular/core';
import { GeoUtils } from '../../../core/utils/geo-utils';
import { DEFAULT_POIS } from '../../../shared/data/default-pois';
import { PointOfInterest, PoiView } from '../../../shared/models/poi.model';
import { POI_CONFIG } from '../../../core/config/poi.config';
import { ArStateService } from './ar-state.service';

@Injectable({ providedIn: 'root' })
export class PoiService {
    private readonly config = inject(POI_CONFIG);
    private readonly VISIBLE_RADIUS = this.config.visibilityRadius;
    private readonly state = inject(ArStateService);

    readonly poisResource = signal<PointOfInterest[]>(DEFAULT_POIS);

    readonly poisWithDistance = computed<PoiView[]>(() => {
        const userPos = this.state.userPosition();
        const currentPois = this.poisResource();

        if (!userPos) return [];

        return currentPois.map(poi => {
            const distance = GeoUtils.haversine(userPos.lat, userPos.lng, poi.lat, poi.lng);

            return {
                ...poi,
                id: `poi-${poi.name}`,
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

    readonly routeSegments = computed(() => {
        const pois = this.poisResource()
            .filter(p => p.routeOrder !== undefined)
            .sort((a, b) => (a.routeOrder ?? 0) - (b.routeOrder ?? 0));

        const segments = [];
        for (let i = 0; i < pois.length - 1; i++) {
            segments.push({
                start: pois[i],
                end: pois[i + 1],
                segmentIndex: i
            });
        }
        return segments;
    });

    readonly visibleRouteSegments = computed(() => {
        const userPos = this.state.userPosition();
        if (!userPos) return [];

        const allSegments = this.routeSegments();
        const maxDistance = this.config.visibilityRadius;

        return allSegments.filter(segment => {
            const distToStart = GeoUtils.haversine(
                userPos.lat, userPos.lng,
                segment.start.lat, segment.start.lng
            );
            const distToEnd = GeoUtils.haversine(
                userPos.lat, userPos.lng,
                segment.end.lat, segment.end.lng
            );

            return distToStart <= maxDistance || distToEnd <= maxDistance;
        });
    });
}
