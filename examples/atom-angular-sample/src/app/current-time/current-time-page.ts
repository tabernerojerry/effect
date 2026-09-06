import { ChangeDetectionStrategy, Component } from "@angular/core"
import { AsyncResult } from "effect/unstable/reactivity"

import { injectTimeStore } from "../atoms"

/**
 * The `/current-time` route.
 *
 * The other sharing pattern: a store of this component's own, with no token.
 * `injectTimeStore` calls `injectMakeAtom` here, so the subscription belongs to
 * this component and is released when the route is left. The atom publishes an
 * `AsyncResult`, and `computed` narrows it to the one string the template
 * renders; `refresh` re-runs the effect.
 */
@Component({
  selector: "app-current-time-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-6">
      <h2 class="text-xl font-semibold tracking-tight">Current Time</h2>
      <p class="mt-1.5 max-w-2xl text-muted-foreground">
        A store of this component's own, over an atom built from an
        <code class="text-foreground">Effect</code>. Nothing else reads it, so the value lives
        and dies with this route.
      </p>
    </header>

    <section class="rounded-xl border border-border bg-card p-5 text-card-foreground">
      <div class="mb-4 flex items-center justify-end">
        <button type="button" (click)="handleRefresh()">Refresh</button>
      </div>

      <output class="block text-2xl leading-none tabular-nums">{{ time() }}</output>
    </section>
  `
})
export class CurrentTimePage {
  readonly #store = injectTimeStore()

  readonly time = this.#store.computed((result) =>
    AsyncResult.isSuccess(result) ? new Date(result.value).toISOString() : "Loading…"
  )

  handleRefresh(): void {
    this.#store.refresh()
  }
}
