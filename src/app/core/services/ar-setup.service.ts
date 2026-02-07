import { Injectable } from '@angular/core';
import 'aframe';
import '@ar-js-org/ar.js-next';
import '@ar-js-org/arjs-plugin-artoolkit';
import '@ar-js-org/arjs-plugin-threejs';
import 'aframe-look-at-component';
import 'locar';
import 'locar-aframe';

@Injectable({
    providedIn: 'root'
})
export class ArSetupService {
    initialize() {
    }
}
