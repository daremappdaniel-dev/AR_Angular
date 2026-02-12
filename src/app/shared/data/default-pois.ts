import { PointOfInterest } from '../models/poi.model';
import { POI_CONSTANTS } from '../../core/constants/poi.constants';

export const DEFAULT_POIS: PointOfInterest[] = [
    {
        name: 'Cerca (8m Norte)',
        lat: 40.6516893,
        lng: -4.6958771,
        model: POI_CONSTANTS.DEFAULT_MODEL,
        routeOrder: 0
    },
    {
        name: 'Lejos (20m Este)',
        lat: 40.6516093,
        lng: -4.6956771,
        model: POI_CONSTANTS.DEFAULT_MODEL,
        routeOrder: 1
    },
    {
        name: 'Invisible (100m Oeste)',
        lat: 40.6516093,
        lng: -4.6970771,
        model: POI_CONSTANTS.DEFAULT_MODEL,
        routeOrder: 2
    }
];
