export class GeoUtils {
    private static readonly R = 6371e3;

    static haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

    static calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        const theta = Math.atan2(y, x);
        return (theta * 180 / Math.PI + 360) % 360;
    }

    static gpsToCartesian(target: { lat: number, lng: number, altitude?: number }, origin: { lat: number, lng: number, altitude?: number }): { x: number, y: number, z: number } {
        const HALF_QUATOR = 20037508.34;

        const mercatorX = (lng: number) => lng * HALF_QUATOR / 180;
        const mercatorZ = (lat: number) => Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * HALF_QUATOR / 180;

        const x = mercatorX(target.lng) - mercatorX(origin.lng);
        const z = mercatorZ(target.lat) - mercatorZ(origin.lat);

        return {
            x: x,
            y: (target.altitude || 0) - (origin.altitude || 0),
            z: -z
        };
    }

    static calculateDistance(p1: { x: number, z: number }, p2: { x: number, z: number }): number {
        return Math.hypot(p2.x - p1.x, p2.z - p1.z);
    }
}
