export class MockGeolocation {
    private static watchIdCounter = 0;
    private static watchers = new Map<number, PositionCallback>();
    private static currentPos = {
        coords: {
            latitude: 40.99520,
            longitude: -5.719779,
            accuracy: 10,
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
            const accuracy = useHighAccuracy ? 8 : 100;
            const delay = useHighAccuracy ? 5000 : 100;

            const position = {
                ...this.currentPos,
                coords: {
                    ...this.currentPos.coords,
                    accuracy
                }
            };

            setTimeout(() => success(position as any), delay);
        };

        navigator.geolocation.watchPosition = (success, error, options?: PositionOptions) => {
            const id = this.watchIdCounter++;
            this.watchers.set(id, success);

            const useHighAccuracy = options?.enableHighAccuracy ?? true;
            const accuracy = useHighAccuracy ? 8 : 100;
            const delay = useHighAccuracy ? 5000 : 100;

            const position = {
                ...this.currentPos,
                coords: {
                    ...this.currentPos.coords,
                    accuracy
                }
            };

            setTimeout(() => success(position as any), delay);

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
