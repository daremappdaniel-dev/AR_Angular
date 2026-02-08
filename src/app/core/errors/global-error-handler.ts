import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { ErrorLoggingService } from '../services/error-logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private readonly notificationService = inject(NotificationService);
    private readonly loggingService = inject(ErrorLoggingService);
    private readonly zone = inject(NgZone);

    handleError(error: any): void {
        const message = error?.message || 'Error desconocido';

        this.loggingService.logError(error);

        this.zone.run(() => {
            if (message.includes('NotAllowedError') || message.includes('Permission denied')) {
                this.notificationService.showError('Acceso a cámara/GPS denegado. Revisa los permisos.');
            } else if (message.includes('WebGL')) {
                this.notificationService.showError('Tu dispositivo no soporta WebGL para RA.');
            } else {
                this.notificationService.showError('Ocurrió un error inesperado.');
            }
        });
    }
}

