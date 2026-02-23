import { Component, ChangeDetectionStrategy, inject, ViewChild, afterRenderEffect, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArGraphicsComponent } from './components/ar-graphics.component';
import { ArHudComponent } from './components/ar-hud.component';
import { PoiService } from './services/poi.service';
import { GpsService } from '../../core/services/sensors/gps.service';
import { PermissionsService } from '../../core/services/system/permissions.service';

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
  private readonly permissionsService = inject(PermissionsService);
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

      if (poiManager?.entityPool.size === 0) {
        const allPois = this.poiService.poisResource();
        poiManager.initializeEntities(allPois);
      }
    }, 100);
  }

  private async iniciarCamara(): Promise<void> {
    const hasPermission = await this.permissionsService.requestCameraPermission();
    if (!hasPermission) return;

    try {
      const stream = await this.ngZone.runOutsideAngular(() =>
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
      );

      this.graphics.setVideoStream(stream);
    } catch { }
  }


  private sincronizarDatosMotor(): void {
    afterRenderEffect(() => {
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

    (globalThis as any).__arRouteSegments = this.poiService.visibleRouteSegments();

    const poiManager = sceneEl.systems['poi-manager'];
    poiManager?.setMarkers(pois);
  }
}