import { Injectable } from '@angular/core';
import 'aframe';
import 'aframe-look-at-component';
import 'locar';
import 'locar-aframe';

@Injectable({ providedIn: 'root' })
export class ArSetupService {
    get THREE() {
        return (window as any).AFRAME?.THREE;
    }

    initialize() { }
}