import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { LeagueState } from './store/league/league.state';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay()),importProvidersFrom(
    NgxsModule.forRoot([LeagueState]),
    NgxsReduxDevtoolsPluginModule.forRoot()
  ),        provideAnimationsAsync(),
  providePrimeNG({
      theme: {
          preset: Aura
      }
  })
]
};
