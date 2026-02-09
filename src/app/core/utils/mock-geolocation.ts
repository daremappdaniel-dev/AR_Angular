export class MockGeolocation {
    private static watchIdCounter = 0;
    private static watchers = new Map<number, PositionCallback>();
    private static currentPos = {
        coords: {
            latitude: 40.99520, // Tu posición inicial alejada
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
        console.warn('⚠️ MOCK GPS ACTIVADO: Ignorando sensores reales del navegador.');

        if (!navigator.geolocation) {
            (navigator as any).geolocation = {};
        }

        navigator.geolocation.getCurrentPosition = (success, error) => {
            success(this.currentPos as any);
        };

        navigator.geolocation.watchPosition = (success, error) => {
            const id = this.watchIdCounter++;
            this.watchers.set(id, success);

            // Emitir posición inicial inmediatamente
            setTimeout(() => success(this.currentPos as any), 100);

            return id;
        };

        navigator.geolocation.clearWatch = (id) => {
            this.watchers.delete(id);
        };

        // Exponer método global para movernos desde la consola del navegador
        (window as any).teleport = (lat: number, lng: number) => {
            this.currentPos.coords.latitude = lat;
            this.currentPos.coords.longitude = lng;
            this.watchers.forEach(cb => cb(this.currentPos as any));
            console.log(`🚀 Teletransportado a: ${lat}, ${lng}`);
        };
    }
}
