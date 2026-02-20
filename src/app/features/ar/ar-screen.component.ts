import { Component, ChangeDetectionStrategy, inject, ViewChild, effect, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArGraphicsComponent } from './components/ar-graphics.component';
import { ArHudComponent } from './components/ar-hud.component';
import { PoiService } from './services/poi.service';
import { GpsService } from '../../core/services/sensors/gps.service';

@Component({
  selector: 'app-ar-screen',
  standalone: true,
  imports: [CommonModule, ArGraphicsComponent, ArHudComponent],
  template: `
    <div class="screen-container">
      <app-ar-graphics #graphics></app-ar-graphics>
      <app-ar-hud></app-ar-hud>
    </div>
  `,
  styles: [`
    .screen-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: transparent;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArScreenComponent implements AfterViewInit {
  protected readonly poiService = inject(PoiService);
  protected readonly gps = inject(GpsService);
  private readonly ngZone = inject(NgZone);

  @ViewChild('graphics') graphics!: ArGraphicsComponent;


  constructor() {
    this.sincronizarDatosMotor();
  }

  ngAfterViewInit(): void {
    this.iniciarCamara();

    setTimeout(() => {
      const sceneEl = (this.graphics as any).sceneRef?.nativeElement;
      const poiManager = sceneEl?.systems?.['poi-manager'];

      if (poiManager && poiManager.entityPool.size === 0) {
        const allPois = this.poiService.poisResource();
        poiManager.initializeEntities(allPois);
      }
    }, 100);
  }

  private async iniciarCamara(): Promise<void> {
    try {
      const stream = await this.ngZone.runOutsideAngular(() =>
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
      );

      this.graphics.setVideoStream(stream);
    } catch (err) {
      this.gestionarErrorCamara(err);
    }
  }

  private gestionarErrorCamara(err: unknown): void {
  }

  private sincronizarDatosMotor(): void {
    effect(() => {
      const pois = this.poiService.visiblePois();
      const pos = this.gps.currentPosition();

      if (pos && this.graphics) {
        this.actualizarEscena(pois);
      }
    });
  }

  private actualizarEscena(pois: any[]): void {
    const sceneEl = (this.graphics as any).sceneRef?.nativeElement;
    if (!sceneEl) return;

    const poiManager = sceneEl.systems['poi-manager'];
    if (poiManager) {
      poiManager.setMarkers(pois);
    }

    const routeSystem = sceneEl.systems['route-system'];
    const locarEntity = sceneEl.querySelector('[locar-camera]') as any;
    const locar = locarEntity?.components?.['locar-camera']?.locar;

    if (routeSystem && locar) {
      const THREE = (globalThis as any).AFRAME.THREE;
      const segments = this.poiService.visibleRouteSegments();

      routeSystem.clearRoutes();

      segments.forEach(segment => {
        const startWorldPos = locar.lonLatToWorldCoords(segment.start.lng, segment.start.lat);
        const endWorldPos = locar.lonLatToWorldCoords(segment.end.lng, segment.end.lat);

        const startPoint = new THREE.Vector3(startWorldPos[0], 0, startWorldPos[1]);
        const endPoint = new THREE.Vector3(endWorldPos[0], 0, endWorldPos[1]);

        routeSystem.createRoute([startPoint, endPoint]);
      });
    }
  }
}