import { Component, ChangeDetectionStrategy, inject, ElementRef, ViewChild, NgZone, CUSTOM_ELEMENTS_SCHEMA, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GpsService } from '../../../core/services/sensors/gps.service';
import { ArStateService } from '../services/ar-state.service';
import { AR_CONFIG } from '../../../../engine-ar/ar-config';

@Component({
  selector: 'app-ar-graphics',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <a-scene #scene 
             embedded 
             vr-mode-ui="enabled: false"
             background="transparent: true"
             renderer="antialias: true; logarithmicDepthBuffer: true; colorManagement: true; alpha: true;"
             stability 
             (ar-stable)="onStable()"
             (camera-error)="onCameraError($event)">

        <video #videoElement 
               autoplay 
               muted 
               playsinline 
               style="display: none;"></video>

        <a-entity #camera 
                  camera 
                  position="0 1.6 0"
                  look-controls="enabled: false"
                  [attr.locar-camera-custom]="'gpspos: ' + gpsCoords()">
        </a-entity>

        <a-entity [attr.visible]="state.isStabilized()">
            <ng-content></ng-content>
        </a-entity>

        <a-entity [attr.ar-occluder]="occluderConfig"></a-entity>
    </a-scene>
  `,
  styles: [`
    :host { 
      display: block; 
      height: 100vh; 
      width: 100%; 
      overflow: hidden; 
      position: relative;
    }
    
    a-scene { 
      width: 100%; 
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    
    :host ::ng-deep .a-canvas {
      background: transparent !important;
      pointer-events: auto;
    }
    
    :host ::ng-deep video {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      z-index: -1 !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArGraphicsComponent {
  protected readonly state = inject(ArStateService);
  private readonly gps = inject(GpsService);
  private readonly ngZone = inject(NgZone);

  @ViewChild('scene') public sceneRef!: ElementRef;
  @ViewChild('camera') cameraRef!: ElementRef;
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;

  protected readonly gpsCoords = computed(() => {
    const pos = this.gps.currentPosition();
    const acc = this.gps.accuracy();

    const val = pos ? `${pos.lng},${pos.lat},0,${acc}` : '';
    console.log('[Angular GPS Output]', val);
    return val;
  });

  protected readonly occluderConfig = `width: ${AR_CONFIG.OCCLUDER.GEOMETRY[0]}; height: ${AR_CONFIG.OCCLUDER.GEOMETRY[1]}; depth: ${AR_CONFIG.OCCLUDER.GEOMETRY[2]}`;

  constructor() {
    this.monitorearGps();
    this.iniciarBucleSeguimiento();
  }

  private monitorearGps(): void {
    effect(() => {
      this.state.updateGpsAccuracy(this.gps.accuracy());
    });
  }



  private iniciarBucleSeguimiento(): void {
    let lastY = 0;

    this.ngZone.runOutsideAngular(() => {
      const actualizarPosicion = () => {
        const y = this.cameraRef?.nativeElement?.object3D?.position?.y ?? 0;

        if (Math.abs(y - lastY) > 0.05) {
          lastY = y;
          this.ngZone.run(() => this.state.updateCameraHeight(y));
        }

        requestAnimationFrame(actualizarPosicion);
      };
      requestAnimationFrame(actualizarPosicion);
    });
  }

  protected onStable(): void {
    this.ngZone.run(() => this.state.setStabilized(true));
  }

  protected onCameraError(event: any): void {
    console.error('[AR] Camera Error:', event);
  }

  public setVideoStream(stream: MediaStream): void {
    const video = this.videoRef.nativeElement;
    video.srcObject = stream;
    video.style.display = 'block';

    this.ngZone.runOutsideAngular(() => {
      video.play().catch(() => { });
    });
  }
}
