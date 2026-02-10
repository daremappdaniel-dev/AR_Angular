import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { NotificationService } from '../services/system/notification.service';
import { ErrorLoggingService } from './error-logging.service';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private readonly notificationService = inject(NotificationService);
    private readonly loggingService = inject(ErrorLoggingService);
    private readonly zone = inject(NgZone);

    handleError(error: any): void {
        const message = error?.message || ERROR_MESSAGES.UNKNOWN;

        this.loggingService.logError(error);

        this.zone.run(() => {
            if (message.includes('NotAllowedError') || message.includes('Permission denied')) {
                this.notificationService.showError(ERROR_MESSAGES.PERMISSION_DENIED);
            } else if (message.includes('WebGL')) {
                this.notificationService.showError(ERROR_MESSAGES.WEBGL_UNSUPPORTED);
            } else {
                this.notificationService.showError(ERROR_MESSAGES.UNEXPECTED);
            }
        });
    }
}

