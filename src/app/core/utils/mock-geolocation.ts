export class MockGeolocation {
    private static watchIdCounter = 0;
    private static readonly watchers = new Map<number, PositionCallback>();

    private static readonly initialLat = 40.416775;
    private static readonly initialLng = -3.70379;

    private static readonly DEFAULT_ACCURACY = 10;
    private static readonly HIGH_ACCURACY_VAL = 8;
    private static readonly LOW_ACCURACY_VAL = 100;
    private static readonly HIGH_ACCURACY_DELAY = 5000;
    private static readonly LOW_ACCURACY_DELAY = 100;

    private static readonly currentPos = {
        coords: {
            latitude: this.initialLat,
            longitude: this.initialLng,
            accuracy: this.DEFAULT_ACCURACY,
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
            const accuracyVal = useHighAccuracy ? this.HIGH_ACCURACY_VAL : this.LOW_ACCURACY_VAL;
            const delayVal = useHighAccuracy ? this.HIGH_ACCURACY_DELAY : this.LOW_ACCURACY_DELAY;

            const position = {
                ...this.currentPos,
                coords: {
                    ...this.currentPos.coords,
                    accuracy: accuracyVal
                }
            };

            setTimeout(() => success(position as any), delayVal);
        };

        navigator.geolocation.watchPosition = (success, error, options?: PositionOptions) => {
            const id = this.watchIdCounter++;
            this.watchers.set(id, success);

            const useHighAccuracy = options?.enableHighAccuracy ?? true;
            const accuracyVal = useHighAccuracy ? this.HIGH_ACCURACY_VAL : this.LOW_ACCURACY_VAL;
            const delayVal = useHighAccuracy ? this.HIGH_ACCURACY_DELAY : this.LOW_ACCURACY_DELAY;

            const position = {
                ...this.currentPos,
                coords: {
                    ...this.currentPos.coords,
                    accuracy: accuracyVal
                }
            };

            setTimeout(() => success(position as any), delayVal);

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
