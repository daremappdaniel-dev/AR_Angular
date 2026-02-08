import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArSceneComponent } from './features/ar-scene/ar-scene.component';
import { ToastComponent } from './shared/ui/toast/toast.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, ArSceneComponent, ToastComponent],
    template: `
      <app-toast></app-toast>
      <app-ar-scene></app-ar-scene>
    `
})
export class AppComponent { }
