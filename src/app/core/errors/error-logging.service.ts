import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ErrorLoggingService {
    logError(error: any) {
        if (!environment.production) {
            console.error('Error Logging Service:', error);
        }
    }
}
