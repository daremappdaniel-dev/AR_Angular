import 'aframe';
import 'locar';
import './engine-ar/components/locar-camera-custom';
import './engine-ar/components/world-position';

import './engine-ar/components/place-marker.js';
import './engine-ar/systems/poi-manager.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';


await bootstrapApplication(AppComponent, appConfig);