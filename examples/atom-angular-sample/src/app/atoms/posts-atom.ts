import { Effect, Match, Option, Schema } from "effect"

import { inject, InjectionToken } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { type AtomStore, injectMakeAtom } from "@effect/atom-angular"
import { FetchHttpClient } from "effect/unstable/http"
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi"
import { KeyValueStore } from "effect/unstable/persistence"
import { Atom, AtomHttpApi } from "effect/unstable/reactivity"

const PostSchema = Schema.Struct({
  userId: Schema.Number,
  id: Schema.Number,
  title: Schema.String,
  body: Schema.String
})

const PostsSchema = Schema.Array(PostSchema)

export type TPost = typeof PostSchema.Type

const API_BASE_URL = "https://jsonplaceholder.typicode.com"
const REACTIVITY_KEY = {
  POSTS: "POST_LISTS"
}
const KEY_VALUE_STORE = {
  POST_ID: "post_id"
}

/**
 * The shape of the remote API.
 *
 * Declaring the endpoints with their schemas is what gives the atoms below a
 * typed success value: the response is decoded through `PostSchema` before it
 * ever reaches a component, so the template never handles raw JSON.
 */
class PostsApi extends HttpApi.make("PostsApi").add(
  HttpApiGroup.make("posts")
    .add(HttpApiEndpoint.get("getPosts", "/posts", { success: PostsSchema }))
    .add(
      HttpApiEndpoint.get("getPost", "/posts/:id", {
        /**
         * The `:id` in the template only shapes the URL. Declaring `params` is
         * what puts `params` on the client request type. The fields are wrapped
         * in a string-tree codec, so they encode to strings on the way out.
         */
        params: { id: Schema.String },
        success: PostSchema
      })
    )
) {}

/**
 * The client service, and the factory for every atom in this file.
 *
 * `AtomHttpApi.Service` binds the API to a runtime — here `FetchHttpClient` —
 * and exposes `query`, which turns one endpoint into an atom. The layer is
 * built once by the `AtomRegistry`, so all the atoms below share a single
 * client instance rather than each opening their own.
 */
class PostsClient extends AtomHttpApi.Service<PostsClient>()("PostsClient", {
  api: PostsApi,
  httpClient: FetchHttpClient.layer,
  baseUrl: API_BASE_URL
}) {}

/**
 * The post list.
 *
 * Like the counter atoms, this is a module-level constant whose value lives in
 * the registry — the request runs once for the first subscriber and every later
 * one is served from that cached `AsyncResult`. `reactivityKeys` is the handle
 * for invalidation: anything that publishes {@link REACTIVITY_KEY.POSTS} makes
 * this atom refetch.
 */
export const postsAtom = PostsClient.query("posts", "getPosts", {
  reactivityKeys: [REACTIVITY_KEY.POSTS]
})

/**
 * A single post, keyed by id.
 *
 * `Atom.family` keeps one atom per id, so each post is cached independently
 * and navigating back to one already visited renders from the registry instead
 * of hitting the network. The shared {@link REACTIVITY_KEY.POSTS} key means an
 * invalidation of the list also invalidates the members.
 */
export const postAtom = Atom.family((id: string) =>
  PostsClient.query("posts", "getPost", { params: { id }, reactivityKeys: [REACTIVITY_KEY.POSTS, id] })
)

/** A store over {@link postsAtom}, for components that render the list. */
export const injectPostsStore = () => injectMakeAtom(postsAtom)

/**
 * A store over the {@link postAtom} member for the post currently being viewed.
 *
 * Resolving the id is the whole job: it comes from the `:id` route parameter
 * when there is one, and otherwise falls back to {@link postIdAtom} — or, if
 * that is still unset, to the last id written to `localStorage`. Either way the
 * resolved id is written back to the key/value store so a reload survives.
 */
export const injectPostStore = () => {
  const activatedRoute = inject(ActivatedRoute)

  const postIdStore = injectPostIdStore()

  const postId = Effect.gen(function*() {
    const keyValueStore = yield* KeyValueStore.KeyValueStore

    return yield* Option.match(Option.fromNullishOr(activatedRoute.snapshot.paramMap.get("id")), {
      onSome: (value) =>
        Effect.gen(function*() {
          yield* keyValueStore.set(KEY_VALUE_STORE.POST_ID, value)

          return value
        }),
      onNone: () =>
        Effect.gen(function*() {
          const storedId = yield* keyValueStore.get(KEY_VALUE_STORE.POST_ID)

          const signalId = postIdStore.computed((value) =>
            Match.value(value).pipe(
              Match.when(
                (n) => n > 0,
                (v) => String(v)
              ),
              Match.orElse(() => storedId ?? "")
            )
          )

          const id = signalId()

          yield* keyValueStore.set(KEY_VALUE_STORE.POST_ID, id)

          return id
        })
    })
  }).pipe(
    Effect.provide(KeyValueStore.layerStorage(() => localStorage)),
    Effect.runSync
  )

  return injectMakeAtom(postAtom(postId))
}

/** The id the list page last selected. `0` means nothing selected yet. */
export const postIdAtom = Atom.make(0)

/**
 * A route-scoped store over {@link postIdAtom}.
 *
 * The atom itself is global, but the store is provided on the `/posts` route
 * (see `app.routes.ts`), so its registry subscription is released when the user
 * navigates away from the feature instead of living for the whole session.
 */
export const POST_ID_ATOM = new InjectionToken<AtomStore<typeof postIdAtom>>("DEMO:POST_ID_ATOM")

export const injectPostIdStore = () => inject(POST_ID_ATOM)
