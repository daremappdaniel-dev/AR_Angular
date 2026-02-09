import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  NgZone,
  OnDestroy,
  effect
} from '@angular/core';
import { PoiService } from '../../core/services/poi.service';
import { GpsService } from '../../core/services/gps.service';
import { MapDebugComponent } from '../map-debug/map-debug.component';
import { AR_TEXT } from '../../core/constants/ar-text.constants';
import { AR_LOGS } from '../../core/constants/ar-logs.constants';
import { GeoUtils } from '../../core/utils/geo-utils';

@Component({
  selector: 'app-ar-viewer',
  standalone: true,
  imports: [MapDebugComponent],
  templateUrl: './ar-viewer.component.html',
  styleUrl: './ar-viewer.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArViewerComponent implements AfterViewInit, OnDestroy {
  protected readonly poiService = inject(PoiService);
  protected readonly gps = inject(GpsService);
  protected readonly showMap = signal(false);
  protected readonly TEXT = AR_TEXT;

  @ViewChild('scene') sceneRef?: ElementRef;

  private placesLoaded = false;
  private retryTimer: any;
  private pollingTimer: any;

  constructor(private ngZone: NgZone) {
    effect(() => {
      const pois = this.poiService.poisResource.value();
      if (pois?.length && !this.placesLoaded && this.gps.currentPosition()) {
        this.triggerLoad();
      }
    });
  }

  protected toggleMap = () => this.showMap.update(v => !v);

  async ngAfterViewInit() {
    await this.ngZone.runOutsideAngular(async () => {
      console.log("Esperando carga de motor 3D...");
      await this.waitForSceneLoad();
      console.log("Motor listo. Iniciando GPS...");
      this.setupGpsListener();
    });
  }

  private waitForSceneLoad(): Promise<void> {
    const scene = this.sceneRef?.nativeElement;

    const loadPromise = new Promise<void>((resolve) => {
      if (scene?.hasLoaded) {
        resolve();
      } else {
        scene?.addEventListener('loaded', () => resolve(), { once: true });
      }
    });

    const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 1000));

    return Promise.race([loadPromise, timeoutPromise]);
  }

  ngOnDestroy() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.pollingTimer) clearInterval(this.pollingTimer);
  }

  private setupGpsListener() {
    const locarCameraEl = document.querySelector('[locar-camera]');

    if (!locarCameraEl) {
      console.warn(AR_LOGS.CAMERA_NOT_FOUND);
      this.retryTimer = setTimeout(() => this.setupGpsListener(), 500);
      return;
    }

    const component = (locarCameraEl as any).components['locar-camera'];

    if (!component || !component.locar) {
      console.log(AR_LOGS.WAITING_LOCAR);
      this.retryTimer = setTimeout(() => this.setupGpsListener(), 500);
      return;
    }

    console.log(AR_LOGS.GPS_INIT);
    component.locar.setGpsOptions({ gpsMinDistance: 5 });

    locarCameraEl.addEventListener('gps-initial-position-determined', () => {
      console.log(AR_LOGS.GPS_POS_DETERMINED);
      this.triggerLoad();
    });

    locarCameraEl.addEventListener('gpsupdate', (e: any) => {
      const coords = e.detail.position.coords;
      console.log(AR_LOGS.GPS_UPDATE(coords.latitude, coords.longitude, coords.accuracy));

      this.debugDistances(coords.latitude, coords.longitude);

      if (!this.placesLoaded) {
        this.triggerLoad();
      }
    });

    locarCameraEl.addEventListener('gpserror', (err: any) => {
      console.error(AR_LOGS.GPS_ERROR, err);
    });

    this.pollingTimer = setInterval(() => {
      if (!this.placesLoaded && component.locar && component.locar.lastPosition) {
        console.warn(AR_LOGS.POLLING_FALLBACK);
        this.triggerLoad();
      }
    }, 3000);
  }

  private triggerLoad() {
    if (!this.placesLoaded) {
      const currentPois = this.poiService.poisResource.value();
      if (currentPois && currentPois.length > 0) {
        this.staticLoadPlaces(currentPois);
        this.placesLoaded = true;
      }
    }
  }

  private staticLoadPlaces(places: any[]) {
    const scene = this.sceneRef?.nativeElement;
    if (!scene) return;

    console.log(AR_LOGS.LOADING_MARKERS(places.length));

    places.forEach((place, index) => {
      const entity: any = document.createElement('a-entity');
      const longitude = place.lng || place.lon;

      entity.setAttribute('locar-entity-place', {
        latitude: place.lat,
        longitude: longitude
      });

      entity.setAttribute('place-marker', {
        name: place.name,
        model: "./assets/daremapp/marcador.png"
      });

      entity.setAttribute('scale', '15 15 15');
      entity.setAttribute('id', `marker-${index}`);

      scene.appendChild(entity);
      console.log(AR_LOGS.MARKER_ADDED(place.name, place.lat, longitude));
    });
  }

  private getLocarComponent() {
    const el = document.querySelector('[locar-camera]');
    return (el as any)?.components['locar-camera'];
  }

  private debugDistances(lat1: number, lon1: number) {
    const places = this.poiService.poisResource.value();
    if (!places) return;

    places.forEach((place: any) => {
      const longitude = place.lng || place.lon;
      const dist = GeoUtils.haversine(lat1, lon1, place.lat, longitude);
      if (dist < 100) {
        console.log(AR_LOGS.DISTANCE_DEBUG(place.name, dist));
      }
    });
  }

}