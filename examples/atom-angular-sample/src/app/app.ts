import { ChangeDetectionStrategy, Component } from "@angular/core"
import { RouterOutlet } from "@angular/router"

import { Menu } from "./menu"

@Component({
  selector: "app-root",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Menu],
  template: `
    <main class="mx-auto max-w-5xl px-6 pt-10 pb-16">
      <header class="mb-8">
        <h1 class="mb-6 text-center text-2xl font-semibold tracking-tight">Atom + Angular</h1>
        <app-menu />
      </header>

      <router-outlet />
    </main>
  `
})
// A shell component that only composes its children has no members of its own.
// oxlint-disable-next-line no-extraneous-class
export class App {}
