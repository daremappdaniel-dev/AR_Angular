import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RenderLoopService implements OnDestroy {
    private readonly ngZone = inject(NgZone);
    private readonly callbacks = new Set<FrameRequestCallback>();
    private animationFrameId: number | null = null;
    private isRunning = false;

    register(callback: FrameRequestCallback): void {
        this.callbacks.add(callback);
        if (!this.isRunning && this.callbacks.size > 0) {
            this.startLoop();
        }
    }

    unregister(callback: FrameRequestCallback): void {
        this.callbacks.delete(callback);
        if (this.callbacks.size === 0) {
            this.stopLoop();
        }
    }

    private startLoop(): void {
        if (this.isRunning) return;
        this.isRunning = true;

        this.ngZone.runOutsideAngular(() => {
            const loop = (time: number) => {
                if (!this.isRunning) return;

                this.callbacks.forEach(cb => {
                    try {
                        cb(time);
                    } catch (error) {
                        console.error('Error in render loop callback:', error);
                    }
                });

                this.animationFrameId = requestAnimationFrame(loop);
            };

            this.animationFrameId = requestAnimationFrame(loop);
        });
    }

    private stopLoop(): void {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    ngOnDestroy(): void {
        this.stopLoop();
        this.callbacks.clear();
    }
}
