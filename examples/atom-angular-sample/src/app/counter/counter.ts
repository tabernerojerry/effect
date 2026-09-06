import { ChangeDetectionStrategy, Component } from "@angular/core"
import { injectMakeAtom } from "@effect/atom-angular"

import { countAtom, stepAtom } from "../atoms"

/**
 * Writes the counter.
 *
 * One `injectMakeAtom` store per atom covers both directions: `value()` returns
 * a plain Angular signal, so the template reads it exactly like a `signal()`
 * field, and `set` and `update` write through the same store. Each store
 * releases its registry subscription when this component is destroyed.
 */
@Component({
  selector: "app-counter",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-xl border border-border bg-card p-5 text-card-foreground">
      <h2 class="mb-3 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        Counter
      </h2>

      <output class="mb-4 block text-5xl leading-none tabular-nums">{{ count() }}</output>

      <div class="flex flex-wrap items-center gap-2">
        <button type="button" (click)="handleDecrement()">&minus;{{ step() }}</button>
        <button type="button" (click)="handleIncrement()">+{{ step() }}</button>
        <button type="button" class="ml-auto text-muted-foreground" (click)="handleReset()">
          Reset
        </button>
      </div>

      <label class="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>Step</span>
        <input
          type="number"
          min="1"
          [value]="step()"
          (input)="watchStepChange($event.target.value)"
        />
      </label>
    </section>
  `
})
export class Counter {
  readonly #countStore = injectMakeAtom(countAtom)
  readonly #stepStore = injectMakeAtom(stepAtom)

  readonly count = this.#countStore.value()
  readonly step = this.#stepStore.value()

  handleIncrement(): void {
    this.#countStore.update((count) => count + this.step())
  }

  handleDecrement(): void {
    this.#countStore.update((count) => count - this.step())
  }

  handleReset(): void {
    this.#countStore.set(0)
  }

  watchStepChange(value: string): void {
    const step = Number.parseInt(value, 10)
    this.#stepStore.set(Number.isNaN(step) ? 1 : step)
  }
}
