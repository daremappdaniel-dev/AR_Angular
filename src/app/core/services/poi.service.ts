import { Injectable, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { GpsService } from './gps.service';
import { GeoService } from './geo.service';
import { PointOfInterest } from '../../shared/models/poi.model';
import { PoiView } from '../../shared/models/poi-view.model';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PoiService {
    private readonly CONFIG = {
        DATA_URL: 'assets/pois.json',
        VISIBLE_RADIUS: 1000
    };

    private readonly http = inject(HttpClient);
    private readonly gps = inject(GpsService);
    private readonly geo = inject(GeoService);

    private readonly pois$ = this.http.get<PointOfInterest[]>(this.CONFIG.DATA_URL).pipe(
        catchError(() => of([]))
    );

    private readonly poisSignal = toSignal(this.pois$, { initialValue: [] });

    readonly poisWithDistance = computed<PoiView[]>(() => {
        const userPos = this.gps.currentPosition();
        const currentPois = this.poisSignal();

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