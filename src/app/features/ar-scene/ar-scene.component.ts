import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PoiService } from '../../core/services/poi.service';
import { GpsService } from '../../core/services/gps.service';
import { MapDebugComponent } from '../map-debug/map-debug.component';
import { AR_TEXT } from '../../core/constants/ar-text.constants';

@Component({
  selector: 'app-ar-scene',
  standalone: true,
  imports: [DecimalPipe, MapDebugComponent],
  templateUrl: './ar-scene.component.html',
  styleUrl: './ar-scene.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArSceneComponent {
  protected readonly poiService = inject(PoiService);
  protected readonly gps = inject(GpsService);
  protected readonly showMap = signal(false);
  protected readonly TEXT = AR_TEXT;

  protected toggleMap = () => this.showMap.update(v => !v);

  protected getLocationString = (poi: any) => `${AR_TEXT.LATITUDE_LABEL}: ${poi.lat}; ${AR_TEXT.LONGITUDE_LABEL}: ${poi.lng}`;

  protected getLabel = (poi: any) => `${poi.name}\n${Math.round(poi.distance)}${AR_TEXT.METERS_UNIT}`;
}
