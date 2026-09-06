# Atom + Angular sample

A small Angular application showing how [`@effect/atom-angular`](../../packages/atom/angular) wires Effect Atoms
into Angular's dependency injection and signal system.

## Running

From the repository root, build the workspace packages once, then start the dev server:

```sh
pnpm build
pnpm --filter @effect/example-atom-angular-sample start
```

The app is served on <http://localhost:4200>.

## What it shows

| File                                                                                     | Shows                                                                                                          |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`src/app/app.config.ts`](src/app/app.config.ts)                                         | `provideAtomRegistry()` — one registry for the whole application                                               |
| [`src/app/app.routes.ts`](src/app/app.routes.ts)                                         | Four lazy pages: `/counter` (the default), `/posts`, which nests the detail view at `:id`, and `/current-time` |
| [`src/app/menu/menu.ts`](src/app/menu/menu.ts)                                           | The sub menu, linking to all three sections with `routerLinkActive`                                            |
| [`src/app/atoms/counter-atom.ts`](src/app/atoms/counter-atom.ts)                         | Writable, derived, and Effect-backed atoms as plain module constants                                           |
| [`src/app/atoms/posts-atom.ts`](src/app/atoms/posts-atom.ts)                             | An `AtomHttpApi` client over a typed `HttpApi`, an `Atom.family` keyed by id, and `KeyValueStore`              |
| [`src/app/atoms/time-atom.ts`](src/app/atoms/time-atom.ts)                               | An `Effect`-backed atom, with the `injectMakeAtom` call wrapped in an inject function                          |
| [`src/app/counter/counter.ts`](src/app/counter/counter.ts)                               | One `injectMakeAtom` store per atom: `value()` to read, `set` and `update` to write                            |
| [`src/app/counter/summary.ts`](src/app/counter/summary.ts)                               | A sibling component sharing state with no inputs, plus a derived atom and a mapping function                   |
| [`src/app/counter/saver.ts`](src/app/counter/saver.ts)                                   | An `AsyncResult` atom rendering loading, success, and failure from one signal                                  |
| [`src/app/posts/posts-page.ts`](src/app/posts/posts-page.ts)                             | A query atom on a lazy route, with `matchResult` and `refresh`                                                 |
| [`src/app/posts/post-page.ts`](src/app/posts/post-page.ts)                               | One member of an atom family, resolved from the route parameter                                                |
| [`src/app/current-time/current-time-page.ts`](src/app/current-time/current-time-page.ts) | A store owned by one component, narrowing its `AsyncResult` with `computed`                                    |

The three components on `/counter` are siblings with no inputs between them and no shared service of their own.
They stay in sync because each resolves the same atoms against the registry provided in `app.config.ts`.

That registry is provided at application level, so it outlives every route: the count set on `/counter` and the
posts loaded on `/posts` are still there after navigating away and back, even though each page is a separate
lazily loaded chunk.

`/posts` shows the same idea one level down. `posts-atom.ts` defines the endpoints with `HttpApi`, builds a
client with `AtomHttpApi.Service`, and turns each endpoint into an atom: `postsAtom` for the list, and
`postAtom`, an `Atom.family`, for a single post. The family keys by id, so every post gets its own atom in the
registry and revisiting one is served from cache rather than refetched. Both carry `reactivityKeys`, which is
what lets a write invalidate them.

The detail page never reads the route itself. `injectPostStore` resolves the id — from the `:id` parameter when
it is there, from a `KeyValueStore` backed by `localStorage` when it is not — so the page survives a reload on a
bare `/posts`. The atom that remembers the last visited id is provided once on the parent `posts` route, which
puts it in scope for the list and the detail view alike.

`/current-time` shows the smaller end of the same API. `timeAtom` is built from a plain `Effect`, and
`injectTimeStore` wraps the `injectMakeAtom` call so the component asks for a store rather than for an atom.
Nothing else reads it, so the value belongs to that one component: the store is created when the route is
entered and released when it is left. Instead of `matchResult`, the page uses `computed` to narrow the published
`AsyncResult` down to the single string the template renders, and `refresh` re-runs the effect.

Atom values are exposed as ordinary Angular signals, so templates read them exactly like a `signal()` field and
`ChangeDetectionStrategy.OnPush` works without any extra wiring. Every subscription is released when the
component's injector is destroyed.

## A note on the TypeScript config

[`tsconfig.json`](tsconfig.json) maps `effect` and `@effect/atom-angular` to `dist` with `compilerOptions.paths`.
That exists only because this example lives inside the Effect monorepo, where those packages are linked as
TypeScript source rather than installed builds. An application outside this repository installs them normally
and needs no `paths` entries:

```sh
npm install effect@rc @effect/atom-angular@rc
```

## Angular version

The example tracks Angular 22, the latest release. `@effect/atom-angular` itself supports `>=20.0.0 <23.0.0`.

Angular 22's CLI requires Node.js `^22.22.3 || ^24.15.0 || >=26.0.0`, which this package declares in `engines`.
The repository pins a matching Node version with Volta, and this package picks it up through
`volta.extends`. Angular 22 also requires TypeScript 6, so this package carries its own `typescript`
devDependency rather than using the one at the repository root.
