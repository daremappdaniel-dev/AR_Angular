import { Injectable } from '@angular/core';
import 'aframe';
import 'aframe-look-at-component';
import 'locar-aframe';
import { LocationBased, SphMercProjection } from 'locar';

@Injectable({ providedIn: 'root' })
export class ArSetupService {
    private _locationBased?: LocationBased;

    get THREE() {
        return (window as any).AFRAME?.THREE;
    }

    get locationBased(): LocationBased | undefined {
        return this._locationBased;
    }

    initialize() { }

    initLocationBased(scene: any, camera: any): LocationBased {
        if (!this._locationBased) {
            this._locationBased = new LocationBased(scene, camera);
            this._locationBased.setProjection(new SphMercProjection());
        }
        return this._locationBased;
    }
}