import { ChangeDetectionStrategy, Component } from "@angular/core"
import { RouterLink } from "@angular/router"
import { injectMakeAtom } from "@effect/atom-angular"
import { Effect } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

import { injectPostIdStore, postsAtom } from "../atoms"

/**
 * The `/posts` route.
 *
 * Loaded lazily, so the request behind {@link postsAtom} — a `getPosts` query on
 * the `AtomHttpApi` client — only runs the first time this route is visited.
 * `matchResult` flattens the published `AsyncResult` into one signal covering
 * the loading, success, and failure states, and `refresh` re-runs the query.
 * Each title links to `/posts/:id`, where the `postAtom` family fetches that
 * single post.
 */
@Component({
  selector: "app-posts-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="mb-6">
      <h2 class="text-xl font-semibold tracking-tight">Posts</h2>
      <p class="mt-1.5 max-w-2xl text-muted-foreground">
        A read-only list fetched by an <code>AtomHttpApi</code> client over a typed
        <code>HttpApi</code> definition. The registry caches the loaded value, so leaving this
        route and coming back does not re-run the request. Open a title to load that post on
        its own.
      </p>
    </header>

    <section class="rounded-xl border border-border bg-card p-5 text-card-foreground">
      <div class="mb-4 flex items-center justify-end">
        <button type="button" [disabled]="result().waiting" (click)="handleRefresh()">
          {{ result().waiting ? "Loading…" : "Refresh" }}
        </button>
      </div>

      @switch (result().status) {
        @case ("initial") {
          <p class="text-sm text-muted-foreground">Loading posts…</p>
        }
        @case ("success") {
          <ul class="grid gap-2">
            @for (post of result().value; track post.id) {
              <li class="flex flex-col gap-4 border-b border-border pb-2 last:border-b-0">
                <a
                  class="font-medium transition-colors hover:text-brand"
                  [routerLink]="['/posts', post.id]"
                  (click)="handleUpdatePostId(post.id)"
                >
                  {{ post.title }}
                </a>
                <span class="text-sm text-muted-foreground">{{ post.body }}</span>
              </li>
            }
          </ul>
        }
        @case ("failure") {
          <p class="text-sm text-destructive">{{ result().error }}</p>
        }
      }
    </section>
  `
})
export class PostsPage {
  readonly #posts = injectMakeAtom(postsAtom)
  readonly result = this.#posts.matchResult()

  handleRefresh(): void {
    this.#posts.refresh()
  }

  readonly postIdStore = injectPostIdStore()

  handleUpdatePostId(id: number) {
    this.postIdStore.set(id)

    Effect.gen(function*() {
      const keyValueStore = yield* KeyValueStore.KeyValueStore
      yield* keyValueStore.set("post_id", String(id))
    }).pipe(Effect.provide(KeyValueStore.layerStorage(() => localStorage)), Effect.runSync)
  }
}
