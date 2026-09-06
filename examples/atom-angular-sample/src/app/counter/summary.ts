import { ChangeDetectionStrategy, Component } from "@angular/core"
import { injectAtomValue } from "@effect/atom-angular"

import { countAtom, doubledAtom } from "../atoms"

/**
 * Reads the counter.
 *
 * This component is a sibling of `Counter` with no inputs, no shared parent
 * state, and no injected service of its own. It stays in sync because both
 * components resolve the same atoms against the same registry.
 */
@Component({
  selector: "app-summary",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-xl border border-border bg-card p-5 text-card-foreground">
      <h2 class="mb-3 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        Summary
      </h2>

      <p class="mb-4 text-sm text-muted-foreground">
        A sibling component with no inputs, reading the same atoms.
      </p>

      <dl class="grid gap-2">
        <div class="flex justify-between gap-4 border-b border-border pb-2">
          <dt class="font-mono text-sm text-muted-foreground">count</dt>
          <dd class="m-0 tabular-nums">{{ count() }}</dd>
        </div>
        <div class="flex justify-between gap-4 border-b border-border pb-2">
          <dt class="font-mono text-sm text-muted-foreground">doubled</dt>
          <dd class="m-0 tabular-nums">{{ doubled() }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="font-mono text-sm text-muted-foreground">parity</dt>
          <dd class="m-0 tabular-nums">{{ parity() }}</dd>
        </div>
      </dl>
    </section>
  `
})
export class Summary {
  readonly count = injectAtomValue(countAtom)

  /** A derived atom: the registry recomputes it when the count changes. */
  readonly doubled = injectAtomValue(doubledAtom)

  /** A mapping function derives a value without declaring another atom. */
  readonly parity = injectAtomValue(countAtom)
}
