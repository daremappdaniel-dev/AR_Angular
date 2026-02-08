import { PointOfInterest } from './poi.model';

export interface PoiView extends PointOfInterest {
    readonly id: string;
    readonly label: string;
    readonly distance: number;
    readonly isVisible: boolean;
    readonly screenPosition: {
        readonly x: number;
        readonly y: number;
    };
}
