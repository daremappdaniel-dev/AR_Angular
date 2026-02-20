import { Injectable, inject, effect, OnDestroy } from '@angular/core';
import { GpsService } from '../../../core/services/sensors/gps.service';
import { RenderLoopService } from '../../../core/services/system/render-loop.service';
import { AR_CONFIG } from '../../../../engine-ar/ar-config';

declare const THREE: any;

@Injectable({
    providedIn: 'root'
})
export class AvatarPhysicsService implements OnDestroy {
    private readonly gps = inject(GpsService);
    private readonly loop = inject(RenderLoopService);

    private targetPosition: any;
    private currentPosition: any;

    readonly avatarUniforms: { uAvatarPos: { value: any } };

    private readonly boundTick = this.ejecutarTick.bind(this);
    private isInitialized = false;

    constructor() {
        const threeRef = (globalThis as any).AFRAME?.THREE || (globalThis as any).THREE;

        this.targetPosition = new threeRef.Vector3();
        this.currentPosition = new threeRef.Vector3();
        this.avatarUniforms = {
            uAvatarPos: { value: new threeRef.Vector3() }
        };

        this.conectarGps();
        this.loop.register(this.boundTick);
    }

    private conectarGps(): void {
        effect(() => {
            const pos = this.gps.currentPosition();
            if (pos) {
                this.actualizarObjetivo(pos.lat, pos.lng);
            }
        });
    }

    private actualizarObjetivo(lat: number, lng: number): void {
        this.targetPosition.set(lat, 0, lng);
        if (!this.isInitialized) {
            this.currentPosition.copy(this.targetPosition);
            this.isInitialized = true;
        }
    }

    private ejecutarTick(time: number): void {
        if (!this.isInitialized) return;

        this.suavizarMovimiento();
        this.sincronizarUniforms();
    }

    private suavizarMovimiento(): void {
        this.currentPosition.lerp(this.targetPosition, AR_CONFIG.AVATAR.LERP_FACTOR);
    }

    private sincronizarUniforms(): void {
        this.avatarUniforms.uAvatarPos.value.copy(this.currentPosition);
    }

    ngOnDestroy(): void {
        this.loop.unregister(this.boundTick);
    }
}

