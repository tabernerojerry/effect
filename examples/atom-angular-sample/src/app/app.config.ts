import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core"
import { provideRouter, withComponentInputBinding } from "@angular/router"
import { provideAtomRegistry } from "@effect/atom-angular"

import { routes } from "./app.routes"

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // One registry for the whole application. Every component that injects an
    // atom resolves it against this registry, and it is disposed when the
    // application injector is destroyed.
    provideAtomRegistry()
  ]
}
