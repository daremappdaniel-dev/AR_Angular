import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArStateService } from '../services/ar-state.service';
import { PoiService } from '../services/poi.service';
import { ToastComponent } from '../../../shared/ui/toast/toast.component';
import { AR_TEXT } from '../../../core/constants/ui-resources';

@Component({
  selector: 'app-ar-hud',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="hud-container">
      <div class="overlay">
        <div class="badge" 
             [class.warning]="state.gpsAccuracy() > 10 && state.gpsAccuracy() <= 20"
             [class.stable]="state.gpsAccuracy() <= 10">
          {{ statusLabel() }}
        </div>
        <div class="stats">
          <span>{{ accuracyLabel() }}</span>
          <span>{{ cameraYLabel() }}</span>
          <span>{{ AR_TEXT.POI_COUNT }}{{ poiService.visiblePois().length }}</span>
          <span style="color:#00e5ff">FIXES OK: {{ fixesAceptados() }}</span>
          <button class="calibration-btn" (click)="medirDesviacion()">MEDIR BRUJULA</button>
        </div>
      </div>
      
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .hud-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
      padding: 16px;
      font-family: 'Segoe UI', Roboto, sans-serif;
    }
    .overlay {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .badge {
      align-self: flex-start;
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.6);
      color: #f44336; 
      font-weight: bold;
      font-size: 0.8rem;
      backdrop-filter: blur(4px);
    }
    .badge.warning {
      color: #ffeb3b; 
    }
    .badge.stable {
      color: #4caf50; 
    }
    .stats {
      display: flex;
      flex-direction: column;
      color: white;
      font-size: 0.75rem;
      text-shadow: 1px 1px 2px black;
    }
    .calibration-btn {
      pointer-events: auto;
      margin-top: 8px;
      padding: 6px 14px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      border: 1px solid #fff;
      border-radius: 8px;
      font-size: 0.75rem;
      cursor: pointer;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArHudComponent {
  protected readonly state = inject(ArStateService);
  protected readonly poiService = inject(PoiService);
  protected readonly AR_TEXT = AR_TEXT;

  protected readonly fixesAceptados = signal(0);
  private compassAlpha = 0;

  constructor() {
    globalThis.addEventListener('locar-gps-update', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      this.fixesAceptados.update(n => n + 1);
      this.state.updateUserPosition({ lat: detail.lat, lng: detail.lng });
      this.state.updateGpsAccuracy(detail.accuracy);
    });

    globalThis.addEventListener('deviceorientationabsolute', (e: any) => {
      this.compassAlpha = e.alpha ?? 0;
    });
  }

  protected medirDesviacion(): void {
    console.warn(`[BRUJULA] Alpha: ${this.compassAlpha.toFixed(1)}deg | Desviacion Norte esperada: 0deg`);
  }


  protected readonly statusLabel = computed(() => {
    const acc = this.state.gpsAccuracy();
    const isStable = this.state.isStabilized();

    if (acc > 20) return 'BUSCANDO SEÑAL...';
    if (acc > 10) return AR_TEXT.CALIBRATING;
    return isStable ? AR_TEXT.STABLE : 'CALIBRANDO...';
  });

  protected readonly accuracyLabel = computed(() =>
    `${AR_TEXT.GPS_ACC}${this.state.gpsAccuracy().toFixed(0)}${AR_TEXT.METERS_UNIT}`
  );

  protected readonly cameraYLabel = computed(() =>
    `${AR_TEXT.CAM_Y}${this.state.cameraHeight().toFixed(1)}${AR_TEXT.METERS_UNIT}`
  );
}
