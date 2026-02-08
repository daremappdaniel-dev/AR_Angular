import { Injectable, signal } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GoogleMapsLoaderService {
    private readonly CONFIG = {
        apiKey: environment.googleMapsApiKey,
        version: 'weekly',
        libraries: ['places', 'marker', 'geometry'] as any[]
    };

    private loader = new Loader(this.CONFIG);

    readonly isApiLoaded = signal(false);
    readonly error = signal<string | null>(null);

    constructor() {
        this.init();
    }

    private init() {
        (this.loader as any).load()
            .then(() => this.isApiLoaded.set(true))
            .catch((err: any) => this.error.set(err.message ?? 'MAPS_LOAD_ERROR'));
    }

    getLoader = () => this.loader;
}