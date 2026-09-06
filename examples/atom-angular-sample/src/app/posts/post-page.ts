import { ChangeDetectionStrategy, Component } from "@angular/core"
import { RouterLink } from "@angular/router"
import { injectPostStore } from "../atoms"

/**
 * The `/posts/:id` route.
 *
 * `injectPostStore` resolves the id — from the route when it is there, from the
 * key/value store when it is not — and hands back a store over the matching
 * member of the `postAtom` family. The family keys by id, so each post gets its
 * own atom in the registry and revisiting one is served from cache.
 */
@Component({
  selector: "app-post-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="mb-6">
      <a class="text-sm text-muted-foreground transition-colors hover:text-brand" routerLink="/posts">
        ← Back to posts
      </a>
      <h2 class="mt-2 text-xl font-semibold tracking-tight">Post</h2>
      <p class="mt-1.5 max-w-2xl text-muted-foreground">
        One member of the <code class="text-foreground">postAtom</code> family, keyed by the
        <code class="text-foreground">:id</code> path parameter.
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
          <p class="text-sm text-muted-foreground">Loading post…</p>
        }
        @case ("success") {
          <article class="flex flex-col gap-3">
            <h3 class="text-lg font-medium">{{ result().value?.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ result().value?.body }}</p>
          </article>
        }
        @case ("failure") {
          <p class="text-sm text-destructive">{{ result().error }}</p>
        }
      }
    </section>
  `
})
export class PostPage {
  readonly #post = injectPostStore()
  readonly result = this.#post.matchResult()

  handleRefresh(): void {
    this.#post.refresh()
  }
}
