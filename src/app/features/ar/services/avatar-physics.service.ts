import { Injectable, inject, effect, OnDestroy } from '@angular/core';
import { GpsService } from '../../../core/services/sensors/gps.service';
import { RenderLoopService } from '../../../core/services/system/render-loop.service';
import { AR_CONFIG } from '../../../../engine-ar/ar-config';
import { ThreeVector3 } from '../../../shared/models/three-types.model';

@Injectable({
    providedIn: 'root'
})
export class AvatarPhysicsService implements OnDestroy {
    private readonly gps = inject(GpsService);
    private readonly loop = inject(RenderLoopService);

    private readonly targetPosition: ThreeVector3;
    private readonly currentPosition: ThreeVector3;

    readonly avatarUniforms: { uAvatarPos: { value: ThreeVector3 } };

    private readonly boundTick = this.onTick.bind(this);
    private isInitialized = false;

    constructor() {
        const threeRef = (globalThis as any).AFRAME?.THREE || (globalThis as any).THREE;

        this.targetPosition = new threeRef.Vector3();
        this.currentPosition = new threeRef.Vector3();
        this.avatarUniforms = {
            uAvatarPos: { value: new threeRef.Vector3() }
        };

        this.connectGps();
        this.loop.register(this.boundTick);
    }

    private connectGps(): void {
        effect(() => {
            const pos = this.gps.currentPosition();
            if (pos) {
                this.updateTarget(pos.lat, pos.lng);
            }
        });
    }

    private updateTarget(lat: number, lng: number): void {
        this.targetPosition.set(lat, 0, lng);
        if (!this.isInitialized) {
            this.currentPosition.copy(this.targetPosition);
            this.isInitialized = true;
        }
    }

    private onTick(time: number): void {
        if (!this.isInitialized) return;

        this.applySmoothing();
        this.syncUniforms();
    }

    private applySmoothing(): void {
        this.currentPosition.lerp(this.targetPosition, AR_CONFIG.AVATAR.LERP_FACTOR);
    }

    private syncUniforms(): void {
        this.avatarUniforms.uAvatarPos.value.copy(this.currentPosition);
    }

    ngOnDestroy(): void {
        this.loop.unregister(this.boundTick);
    }
}


