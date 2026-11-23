import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { SERVER_LAUNCHES_READER } from './core/lancamentos.service';
import { createServerLaunchesReader } from './core/server-launches.reader';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: SERVER_LAUNCHES_READER,
      useFactory: createServerLaunchesReader,
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
