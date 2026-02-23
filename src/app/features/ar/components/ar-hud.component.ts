import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArStateService } from '../services/ar-state.service';
import { PoiService } from '../services/poi.service';
import { GpsService } from '../../../core/services/sensors/gps.service';
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
          <span style="color:#00e5ff">DIST: {{ distMovedLabel() }}</span>
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArHudComponent {
  protected readonly state = inject(ArStateService);
  protected readonly poiService = inject(PoiService);
  private readonly gps = inject(GpsService);
  protected readonly AR_TEXT = AR_TEXT;

  protected readonly fixesAceptados = signal(0);

  constructor() {
    globalThis.addEventListener('locar-gps-update', () => {
      this.fixesAceptados.update(n => n + 1);
    });
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

  protected readonly distMovedLabel = computed(() => {
    const dist = this.gps.distMoved();
    return dist === 0 ? '--' : `${dist.toFixed(1)}m`;
  });
}
