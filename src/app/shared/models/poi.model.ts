export interface PointOfInterest {
    readonly name: string;
    readonly lat: number;
    readonly lng: number;
    readonly model: string;
    readonly routeOrder?: number;
}