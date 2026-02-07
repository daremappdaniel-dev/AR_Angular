import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArSceneComponent } from './features/ar-scene/ar-scene.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, ArSceneComponent],
    template: `<app-ar-scene></app-ar-scene>`
})
export class AppComponent { }
