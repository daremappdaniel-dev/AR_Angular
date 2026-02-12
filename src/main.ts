import 'aframe';
import 'locar';
import 'locar-aframe';

import './engine-ar/components/place-marker.js';
import './engine-ar/components/occluder-component.js';
import './engine-ar/systems/route-system.js';
import './engine-ar/systems/stability-system.js';
import './engine-ar/systems/poi-manager.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { MockGeolocation } from './app/core/utils/mock-geolocation';

const ENABLE_MOCK_GPS = false;

if (ENABLE_MOCK_GPS) {
    MockGeolocation.install();
}

await bootstrapApplication(AppComponent, appConfig);