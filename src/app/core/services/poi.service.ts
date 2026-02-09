import { Injectable, inject, computed, resource } from '@angular/core';
import { GpsService } from './gps.service';
import { GeoService } from './geo.service';
import { PointOfInterest } from '../../shared/models/poi.model';
import { PoiView } from '../../shared/models/poi-view.model';

@Injectable({ providedIn: 'root' })
export class PoiService {
    private readonly CONFIG = {
        DATA_URL: 'assets/pois.json',
        VISIBLE_RADIUS: 1000
    };

    private readonly gps = inject(GpsService);
    private readonly geo = inject(GeoService);

    readonly poisResource = resource<PointOfInterest[], unknown>({
        loader: async () => {
            const response = await fetch(this.CONFIG.DATA_URL);
            const data: any[] = await response.json();
            return data.map(p => ({
                ...p,
                lng: p.lng || p.lon
            }));
        }
    });

    readonly poisWithDistance = computed<PoiView[]>(() => {
        const userPos = this.gps.currentPosition();
        const currentPois = this.poisResource.value() ?? [];

        if (!userPos) return [];

        return currentPois.map((poi, index) => ({
            ...poi,
            id: `poi-${index}`,
            label: poi.name,
            distance: this.geo.haversine(userPos.lat, userPos.lng, poi.lat, poi.lng),
            isVisible: false,
            screenPosition: { x: 0, y: 0 }
        })).map(poi => ({
            ...poi,
            isVisible: poi.distance <= this.CONFIG.VISIBLE_RADIUS
        })).sort((a, b) => a.distance - b.distance);
    });

    readonly visiblePois = computed(() =>
        this.poisWithDistance().filter(poi => poi.isVisible)
    );
}
