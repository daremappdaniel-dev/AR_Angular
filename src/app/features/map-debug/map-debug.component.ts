import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, ChangeDetectionStrategy } from '@angular/core';
import { GpsService } from '../../core/services/gps.service';

@Component({
  selector: 'app-map-debug',
  standalone: true,
  template: `
    <gmp-map 
      [attr.center]="centerString()" 
      [attr.zoom]="15" 
      map-id="DEMO_MAP_ID" 
      style="height: 100vh; width: 100%;">
      
      @if (gpsService.currentPosition(); as pos) {
        <gmp-advanced-marker 
          [attr.position]="centerString()" 
          title="Tu ubicación">
        </gmp-advanced-marker>
      }
    </gmp-map>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapDebugComponent {
  protected readonly gpsService = inject(GpsService);

  protected centerString = () => {
    const pos = this.gpsService.currentPosition();
    return pos ? `${pos.lat},${pos.lng}` : '0,0';
  };
}