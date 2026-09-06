import type { Routes } from "@angular/router"
import { injectMakeAtom } from "@effect/atom-angular"
import { POST_ID_ATOM, postIdAtom } from "./atoms"

/**
 * Every page is lazy: each `loadComponent` points at the page file rather than a
 * barrel, so no feature reaches the initial bundle. `/posts` nests the single
 * post at `:id`, which keeps the detail view on the same lazy chunk boundary as
 * the list. `/counter` is the default, and the registry provided at application
 * level outlives all of these routes, so state written on one page is still
 * there after navigating away and back.
 */
export const routes: Routes = [
  {
    path: "counter",
    title: "Counter",
    loadComponent: () => import("./counter/counter-page").then((m) => m.CounterPage)
  },
  {
    path: "posts",
    title: "Posts",
    providers: [
      {
        provide: POST_ID_ATOM,
        useFactory: () => injectMakeAtom(postIdAtom)
      }
    ],
    children: [
      {
        path: "",
        loadComponent: () => import("./posts/posts-page").then((m) => m.PostsPage)
      },
      {
        path: ":id",
        title: "Post",
        loadComponent: () => import("./posts/post-page").then((m) => m.PostPage)
      }
    ]
  },
  {
    path: "current-time",
    title: "Current Time",
    loadComponent: () => import("./current-time/current-time-page").then((m) => m.CurrentTimePage)
  },
  { path: "", pathMatch: "full", redirectTo: "counter" },
  { path: "**", redirectTo: "counter" }
]
