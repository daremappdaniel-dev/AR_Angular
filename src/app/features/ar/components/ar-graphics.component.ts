import { Component, ChangeDetectionStrategy, inject, ElementRef, ViewChild, NgZone, CUSTOM_ELEMENTS_SCHEMA, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GpsService } from '../../../core/services/sensors/gps.service';
import { ArStateService } from '../services/ar-state.service';


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
             renderer="antialias: true; colorManagement: true; alpha: true;"
             stability 
             (ar-stable)="onStable()"
             (camera-error)="onCameraError($event)">

        <video #videoElement 
               autoplay 
               muted 
               playsinline 
               style="display: none;"></video>

        <a-entity camera 
                  position="0 1.6 0"
                  look-controls="enabled: false"
                  [attr.locar-camera-custom]="gpsParams()">
        </a-entity>

        <a-entity [attr.visible]="state.isStabilized()">
            <ng-content></ng-content>
        </a-entity>
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
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;

  protected readonly gpsParams = computed(() => {
    const pos = this.gps.currentPosition();
    if (!pos) return '';
    return `lat: ${pos.lat}; lng: ${pos.lng}; acc: ${this.gps.accuracy()}`;
  });

  constructor() {
    this.monitorGps();
  }

  private monitorGps(): void {
    effect(() => {
      this.state.updateGpsAccuracy(this.gps.accuracy());
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
