import { injectMakeAtom } from "@effect/atom-angular"
import { Effect } from "effect"
import { Atom } from "effect/unstable/reactivity"

export const timeAtom = Atom.make(Effect.sync(() => Date.now()))

export const injectTimeStore = () => injectMakeAtom(timeAtom)
