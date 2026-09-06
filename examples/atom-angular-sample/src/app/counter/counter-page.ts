import { ChangeDetectionStrategy, Component } from "@angular/core"

import { Counter } from "./counter"
import { Saver } from "./saver"
import { Summary } from "./summary"

/**
 * The `/counter` route.
 *
 * Loaded lazily, so none of the counter components reach the initial bundle.
 * The atoms they read live in the application-level registry, which means the
 * count survives navigating to `/posts` and back.
 */
@Component({
  selector: "app-counter-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Counter, Summary, Saver],
  template: `
    <header class="mb-6">
      <h2 class="text-xl font-semibold tracking-tight">Counter</h2>
      <p class="mt-1.5 max-w-2xl text-muted-foreground">
        Three sibling components sharing state through one
        <code class="text-foreground">AtomRegistry</code>, with no inputs and no
        shared service.
      </p>
    </header>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] items-start gap-4">
      <app-counter />
      <app-summary />
      <app-saver />
    </div>
  `
})
// A page component that only composes its children has no members of its own.
// oxlint-disable-next-line no-extraneous-class
export class CounterPage {}
