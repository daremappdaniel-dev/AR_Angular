import { Component } from '@angular/core';
import { ArViewerComponent } from './features/ar-viewer/ar-viewer.component';
import { ToastComponent } from './shared/ui/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ArViewerComponent, ToastComponent],
  template: `
      <app-toast></app-toast>
      <app-ar-viewer></app-ar-viewer>
    `
})
export class AppComponent { }
