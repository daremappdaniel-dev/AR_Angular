import { POI_CONFIG_DEFAULTS } from '../config/poi.config';

export class MockGeolocation {
    private static watchIdCounter = 0;
    private static readonly watchers = new Map<number, PositionCallback>();

    private static readonly initialLat = (POI_CONFIG_DEFAULTS.points.north.lat + POI_CONFIG_DEFAULTS.points.south.lat) / 2;
    private static readonly initialLng = POI_CONFIG_DEFAULTS.points.north.lng;

    private static readonly currentPos = {
        coords: {
            latitude: this.initialLat,
            longitude: this.initialLng,
            accuracy: POI_CONFIG_DEFAULTS.simulation.defaultAccuracy,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
        },
        timestamp: Date.now()
    };

    static install() {

        if (!navigator.geolocation) {
            (navigator as any).geolocation = {};
        }

        navigator.geolocation.getCurrentPosition = (success, error, options?: PositionOptions) => {
            const useHighAccuracy = options?.enableHighAccuracy ?? true;
            const sim = useHighAccuracy ? POI_CONFIG_DEFAULTS.simulation.highAccuracy : POI_CONFIG_DEFAULTS.simulation.lowAccuracy;

            const position = {
                ...this.currentPos,
                coords: {
                    ...this.currentPos.coords,
                    accuracy: sim.value
                }
            };

            setTimeout(() => success(position as any), sim.delay);
        };

        navigator.geolocation.watchPosition = (success, error, options?: PositionOptions) => {
            const id = this.watchIdCounter++;
            this.watchers.set(id, success);

            const useHighAccuracy = options?.enableHighAccuracy ?? true;
            const sim = useHighAccuracy ? POI_CONFIG_DEFAULTS.simulation.highAccuracy : POI_CONFIG_DEFAULTS.simulation.lowAccuracy;

            const position = {
                ...this.currentPos,
                coords: {
                    ...this.currentPos.coords,
                    accuracy: sim.value
                }
            };

            setTimeout(() => success(position as any), sim.delay);

            return id;
        };

        navigator.geolocation.clearWatch = (id) => {
            this.watchers.delete(id);
        };

        (window as any).teleport = (lat: number, lng: number) => {
            this.currentPos.coords.latitude = lat;
            this.currentPos.coords.longitude = lng;
            this.watchers.forEach(cb => cb(this.currentPos as any));
        };
    }
}
