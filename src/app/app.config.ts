import { ApplicationConfig, provideExperimentalZonelessChangeDetection, ErrorHandler, APP_INITIALIZER, inject } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { GlobalErrorHandler } from './core/errors/global-error-handler';
import { ArSetupService } from './core/services/ar-setup.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(withFetch()),
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        {
            provide: APP_INITIALIZER,
            useFactory: () => {
                const arSetup = inject(ArSetupService);
                return () => arSetup.initialize();
            },
            multi: true
        }
    ]
};
