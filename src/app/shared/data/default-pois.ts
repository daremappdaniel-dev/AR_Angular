import { PointOfInterest } from '../models/poi.model';


export const DEFAULT_POIS: PointOfInterest[] = [
    {
        name: 'TEST MOVIL (Aqui mismo)',
        lat: 40.994852, // Muevo 10-11 metros al Sur (Original: 40.994952)
        lng: -5.719627,
        model: '',
        routeOrder: 0
    },
    {
        name: 'Lejos (20m Este)',
        lat: 40.6516093,
        lng: -4.6956771,
        model: '',
        routeOrder: 1
    },
    {
        name: 'Invisible (100m Oeste)',
        lat: 40.6516093,
        lng: -4.6970771,
        model: '',
        routeOrder: 2
    },
    {
        name: 'Mercado chico',
        lat: 40.656612042118844,
        lng: -4.700407329376366,
        model: '',
        routeOrder: 3
    },
    {
        name: 'Calle ambigua',
        lat: 40.65620561281563,
        lng: -4.699718206677127,
        model: '',
        routeOrder: 4
    },
    {
        name: 'Plaza de Santa Teresa',
        lat: 40.65614939887308,
        lng: -4.697641725487889,
        model: '',
        routeOrder: 5
    },
    {
        name: 'Paseo del rastro',
        lat: 40.65427569821218,
        lng: -4.696473461622629,
        model: '',
        routeOrder: 6
    },
    {
        name: 'Paseo del rastro 2',
        lat: 40.65473904174323,
        lng: -4.701905175115641,
        model: '',
        routeOrder: 7
    }
];
