import { ChangeDetectionStrategy, Component } from "@angular/core"
import { injectAtomValue, injectMakeAtom } from "@effect/atom-angular"

import { countAtom, saveCountAtom } from "../atoms"

/**
 * Runs an Effect against the current count.
 *
 * The `AsyncResult` published by the atom carries the loading, success, and
 * failure states, so the template renders the whole request from one signal.
 * The `promiseExit` write mode additionally hands back an `Exit`, which is
 * useful when the caller needs to await the outcome.
 */
@Component({
  selector: "app-saver",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-xl border border-border bg-card p-5 text-card-foreground">
      <h2 class="mb-3 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        Save
      </h2>

      <p class="mb-4 text-sm text-muted-foreground">
        Runs an Effect against the current count. Make the count negative to see the
        failure branch.
      </p>

      <button type="button" [disabled]="result().waiting" (click)="handleSave()">
        {{ result().waiting ? "Saving…" : "Save count" }}
      </button>

      @switch (result().status) {
        @case ("initial") {
          <p class="mt-4 text-sm text-muted-foreground">Nothing saved yet.</p>
        }
        @case ("success") {
          <p class="mt-4 text-sm text-brand">{{ result().value }}</p>
        }
        @case ("failure") {
          <p class="mt-4 text-sm text-destructive">{{ result().error }}</p>
        }
      }
    </section>
  `
})
export class Saver {
  readonly #count = injectAtomValue(countAtom)

  readonly #saveCount = injectMakeAtom(saveCountAtom)
  readonly result = this.#saveCount.matchResult()

  handleSave() {
    this.#saveCount.set(this.#count())
  }
}
