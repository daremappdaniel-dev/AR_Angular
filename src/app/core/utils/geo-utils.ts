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

    static sphMercProject(lng: number, lat: number): [number, number] {
        const R = 6378137;
        const x = R * lng * Math.PI / 180;
        const y = R * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
        return [x, y];
    }
}
