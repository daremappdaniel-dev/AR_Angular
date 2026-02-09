import { PointOfInterest } from '../models/poi.model';
import { POI_CONSTANTS } from '../../core/constants/poi.constants';

export const DEFAULT_POIS: PointOfInterest[] = [
    {
        name: POI_CONSTANTS.NORTH_POINT.NAME,
        lat: POI_CONSTANTS.NORTH_POINT.LAT,
        lng: POI_CONSTANTS.NORTH_POINT.LNG,
        model: POI_CONSTANTS.DEFAULT_MODEL
    },
    {
        name: POI_CONSTANTS.SOUTH_POINT.NAME,
        lat: POI_CONSTANTS.SOUTH_POINT.LAT,
        lng: POI_CONSTANTS.SOUTH_POINT.LNG,
        model: POI_CONSTANTS.DEFAULT_MODEL
    }
];
