import { ChangeDetectionStrategy, Component } from "@angular/core"
import { RouterLink, RouterLinkActive } from "@angular/router"

/**
 * The sub menu.
 *
 * Holds no atoms of its own: it only links to the lazy routes declared in
 * `app.routes.ts`, and `routerLinkActive` marks whichever one is showing.
 */
@Component({
  selector: "app-menu",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="flex justify-center">
      <ul class="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        @for (item of items; track item.path) {
          <li>
            <a
              class="block rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
              routerLinkActive="bg-accent text-accent-foreground"
              [routerLink]="item.path"
            >
              {{ item.label }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `
})
export class Menu {
  /** The lazy routes declared in `app.routes.ts`. */
  readonly items = [
    { path: "/counter", label: "Counter" },
    { path: "/posts", label: "Posts" },
    { path: "/current-time", label: "Current Time" }
  ] as const
}
