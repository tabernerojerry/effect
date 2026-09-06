import * as Effect from "effect/Effect"
import { Atom } from "effect/unstable/reactivity"

/**
 * The counter value.
 *
 * Atoms are declared as plain module-level constants. They hold no state
 * themselves: the value lives in the `AtomRegistry` provided through Angular
 * DI, which is what lets unrelated components share this counter without
 * passing inputs or injecting a service.
 */
export const countAtom = Atom.make(0)

/** How far each click moves {@link countAtom}. */
export const stepAtom = Atom.make(1)

/**
 * Derived from {@link countAtom}. The registry recomputes it whenever the count
 * changes, and nothing writes to it directly.
 */
export const doubledAtom = Atom.make((get) => get(countAtom) * 2)

/**
 * An Effect-backed write.
 *
 * Calling the setter runs the Effect and publishes an `AsyncResult` that moves
 * through `Initial` -> waiting -> `Success` or `Failure`, so the template can
 * render every state of the request without any manual loading flags.
 */
export const saveCountAtom = Atom.fn((count: number) =>
  Effect.gen(function*() {
    yield* Effect.sleep("600 millis")

    if (count < 0) {
      return yield* Effect.fail(`Refusing to save a negative count (${count})`)
    }

    return `Saved count ${count}`
  })
)
