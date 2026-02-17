import { Component, ChangeDetectionStrategy, inject, ElementRef, ViewChild, NgZone, CUSTOM_ELEMENTS_SCHEMA, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArStateService } from '../services/ar-state.service';
import { GpsService } from '../../../core/services/sensors/gps.service';
import { AR_CONFIG } from '../../../../engine-ar/ar-config';

@Component({
  selector: 'app-ar-graphics',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <a-scene #scene 
             embedded 
             gesture-detector 
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
                  look-controls="touchEnabled: false"
                  locar-camera>
        </a-entity>

        <a-entity id="ar-world-root" #worldRoot
                  [attr.position]="worldPositionString()">
            
            <a-entity id="ar-gizmo"
                      [attr.visible]="!state.isStabilized()"
                      geometry="primitive: cone; radiusBottom: 0.2; height: 0.5"
                      material="color: #ff3d3d; opacity: 0.9"
                      rotation="180 0 0"
                      position="0 0 0">
            </a-entity>

            <a-entity id="calibration-guide"
                      [attr.visible]="!state.isStabilized()"
                      geometry="primitive: ring; radiusInner: 0.5; radiusOuter: 0.6"
                      material="color: #00d2ff; shader: flat; opacity: 0.5"
                      rotation="-90 0 0">
            </a-entity>

            <a-entity id="ar-content-group">
                <ng-content></ng-content>
            </a-entity>
        </a-entity>

        <a-entity [attr.ar-occluder]="occluderConfig"></a-entity>
    </a-scene>

    <button class="btn-toggle" (click)="toggleControls()">⚙️</button>

    <div class="ar-controls-overlay" *ngIf="showControls || !state.isStabilized()">
        <button class="btn-up" (click)="moveWorld(0, -0.5)">▲</button>
        <button class="btn-left" (click)="moveWorld(-0.5, 0)">◄</button>
        <button class="btn-reset" (click)="resetWorld()">⟲</button>
        <button class="btn-right" (click)="moveWorld(0.5, 0)">►</button>
        <button class="btn-down" style="grid-column: 2; grid-row: 3;" (click)="moveWorld(0, 0.5)">▼</button>
    </div>
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
      pointer-events: auto !important;
      touch-action: none !important;
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
    
    .btn-toggle {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 1001;
        width: 50px;
        height: 50px;
        font-size: 24px;
        background: rgba(0, 0, 0, 0.6);
        border: 2px solid white;
        color: white;
        border-radius: 50%;
    }

    .ar-controls-overlay {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      display: grid;
      grid-template-columns: repeat(3, 60px);
      grid-template-rows: repeat(2, 60px);
      gap: 10px;
      pointer-events: auto;
    }

    button {
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      font-size: 24px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
    }

    button:active {
      background: rgba(255, 255, 255, 0.2);
    }

    .btn-up { grid-column: 2; grid-row: 1; }
    .btn-left { grid-column: 1; grid-row: 2; }
    .btn-reset { grid-column: 2; grid-row: 2; font-size: 18px; color: #ff3d3d; }
    .btn-right { grid-column: 3; grid-row: 2; }
    .btn-down { grid-column: 2; grid-row: 3; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArGraphicsComponent {
  public readonly state = inject(ArStateService);
  private readonly gps = inject(GpsService);
  private readonly ngZone = inject(NgZone);

  @ViewChild('scene') public sceneRef!: ElementRef;
  @ViewChild('camera') cameraRef!: ElementRef;
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('worldRoot') worldRootRef!: ElementRef;

  protected readonly gpsCoords = computed(() => {
    const pos = this.gps.currentPosition();
    return pos ? `${pos.lng},${pos.lat}` : '';
  });

  protected readonly occluderConfig = `width: ${AR_CONFIG.OCCLUDER.GEOMETRY[0]}; height: ${AR_CONFIG.OCCLUDER.GEOMETRY[1]}; depth: ${AR_CONFIG.OCCLUDER.GEOMETRY[2]}`;

  protected readonly worldPositionString = computed(() => {
    const offset = this.state.calibrationOffset();
    return `${offset.x} 0 ${offset.z}`;
  });

  protected showControls = true;

  constructor() {
    this.monitorearGps();
    this.iniciarBucleSeguimiento();
    this.sincronizarPosicionMundo();
    this.monitorearEstado();
  }

  toggleControls(): void {
    this.showControls = !this.showControls;
  }

  private monitorearEstado(): void {
    effect(() => {
      const stable = this.state.isStabilized();
    });
  }

  private sincronizarPosicionMundo(): void {
    effect(() => {
      const offset = this.state.calibrationOffset();
      const el = this.worldRootRef?.nativeElement;

      if (el && el.object3D) {
        el.object3D.position.set(offset.x, 0, offset.z);
      }
    });
  }

  moveWorld(dx: number, dz: number): void {
    const current = this.state.calibrationOffset();
    this.state.moveCalibration(dx, dz);
  }

  resetWorld(): void {
    this.state.resetCalibration();
  }

  protected onStable(): void {
    this.ngZone.run(() => this.state.setStabilized(true));
  }

  protected onCameraError(event: any): void {
  }

  public setVideoStream(stream: MediaStream): void {
    const video = this.videoRef.nativeElement;
    video.srcObject = stream;
    video.style.display = 'block';

    this.ngZone.runOutsideAngular(() => {
      video.play().then(() => {
      }).catch((err) => {
      });
    });
  }

  private monitorearGps(): void {
    effect(() => {
      const acc = this.gps.accuracy();
      const pos = this.gps.currentPosition();
      this.state.updateGpsAccuracy(acc);
    });
  }

  private iniciarBucleSeguimiento(): void {
    this.ngZone.runOutsideAngular(() => {
      let frameCount = 0;
      const actualizarPosicion = () => {
        const cam = this.cameraRef?.nativeElement?.object3D;
        if (cam) {
          const y = cam.position.y;
          this.state.updateCameraHeight(y);

          if (frameCount++ % 120 === 0) {
          }
        }
        requestAnimationFrame(actualizarPosicion);
      };
      requestAnimationFrame(actualizarPosicion);
    });
  }
}
