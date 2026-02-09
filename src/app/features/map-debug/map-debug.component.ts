import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, input } from '@angular/core';
import { PoiView } from '../../shared/models/poi-view.model';

@Component({
  selector: 'app-map-debug',
  standalone: true,
  template: `
    <div style="position: absolute; bottom: 20px; left: 20px; z-index: 1000; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px;">
      <button (click)="openStreetView()" class="btn-sv">
        Street View 📍
      </button>
    </div>

    <gmp-map 
      [attr.center]="centerString()" 
      [attr.zoom]="16" 
      map-id="DEMO_MAP_ID" 
      style="height: 100vh; width: 100%;">
      
      @if (currentPos(); as pos) {
        <gmp-advanced-marker 
          [attr.position]="pos.lat + ',' + pos.lng" 
          title="Tú (GPS)">
            <div style="background: blue; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>
        </gmp-advanced-marker>
      }

      @for (poi of pois(); track poi.id) {
         <gmp-advanced-marker 
          [attr.position]="poi.lat + ',' + poi.lng" 
          [title]="poi.name">
        </gmp-advanced-marker>
      }
    </gmp-map>
  `,
  styles: [`
    .btn-sv {
      background: #ffcc00; 
      border: none; 
      padding: 8px 16px; 
      font-weight: bold; 
      cursor: pointer;
      border-radius: 4px;
    }
  `],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapDebugComponent {
  currentPos = input<google.maps.LatLngLiteral | null>(null);
  pois = input<PoiView[]>([]);

  protected centerString = () => {
    const pos = this.currentPos();
    return pos ? `${pos.lat},${pos.lng}` : '0,0';
  };

  protected openStreetView() {
    const pos = this.currentPos();
    if (pos) {
      const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${pos.lat},${pos.lng}`;
      window.open(url, '_blank');
    }
  }
}