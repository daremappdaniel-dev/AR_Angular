import { Injectable, inject } from '@angular/core';
import { GeoCoordinate } from '../models/route-point.interface';
import { ArSetupService } from './ar-setup.service';

@Injectable({
    providedIn: 'root'
})
export class GeoService {
    private readonly arSetup = inject(ArSetupService);
    private readonly R = 6371e3;

    haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const deltaPhi = (lat2 - lat1) * Math.PI / 180;
        const deltaLambda = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return this.R * c;
    }

    calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        const theta = Math.atan2(y, x);
        return (theta * 180 / Math.PI + 360) % 360;
    }

    gpsToCartesian(target: GeoCoordinate, origin: GeoCoordinate): { x: number, y: number, z: number } {
        const lb = this.arSetup.locationBased;
        if (lb) {
            const coords = lb.lonLatToWorldCoords(target.lng, target.lat);
            return {
                x: coords[0],
                y: (target.altitude || 0) - (origin.altitude || 0),
                z: coords[1]
            };
        }

        const mercatorX_target = target.lng * 20037508.34 / 180;
        const mercatorZ_target = Math.log(Math.tan((90 + target.lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;

        const mercatorX_origin = origin.lng * 20037508.34 / 180;
        const mercatorZ_origin = Math.log(Math.tan((90 + origin.lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;

        return {
            x: mercatorX_target - mercatorX_origin,
            y: (target.altitude || 0) - (origin.altitude || 0),
            z: -(mercatorZ_target - mercatorZ_origin)
        };
    }

    calculateDistance(p1: { x: number, z: number }, p2: { x: number, z: number }): number {
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        return Math.hypot(dx, dz);
    }

    calculateDistanceMeters(p1: { lat: number, lng: number }, p2: { lat: number, lng: number }): number {
        return this.haversine(p1.lat, p1.lng, p2.lat, p2.lng);
    }
}