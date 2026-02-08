import { Injectable } from '@angular/core';
import { GeoCoordinate } from '../models/route-point.interface';

@Injectable({
    providedIn: 'root'
})
export class GeoService {
    haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        return (window as any).LocAR.Utils.haversineDistance(lat1, lon1, lat2, lon2);
    }

    calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
        return (window as any).LocAR.Utils.bearing(lat1, lon1, lat2, lon2);
    }

    gpsToCartesian(target: GeoCoordinate, origin: GeoCoordinate): { x: number, y: number, z: number } {
        const position = (window as any).LocAR.Utils.project(
            target.lat,
            target.lng,
            origin.lat,
            origin.lng
        );

        return {
            x: position.x,
            y: (target.altitude || 0) - (origin.altitude || 0),
            z: position.z
        };
    }

    calculateDistance(p1: { x: number, z: number }, p2: { x: number, z: number }): number {
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    calculateDistanceMeters(p1: { lat: number, lng: number }, p2: { lat: number, lng: number }): number {
        return this.haversine(p1.lat, p1.lng, p2.lat, p2.lng);
    }
}