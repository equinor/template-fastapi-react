# Extending the web

The web is grouped by features.

## Codebase structure

The web has a feature-based folder structure.

```
├── web/
│   └── src/
│       ├── api/
│       ├── common/
│       ├── features/
│       │   ├── todos/
│       │   └── ...
│       ├── hooks/
│       └── pages/
└── ...
```

- `api` contains the auto-generated API client
- `common` contains shared code like generic components
- `features` contains features e.g. todo-list
- `hooks` contains reusable hooks
- `pages` contains entrypoints (pages that are used by the router)

## Application tree

```mermaid
flowchart
    subgraph web
    AuthProvider-. imported from .->react-oauth2-code-pkce;
    index --> AuthProvider
    AuthProvider --> app
    app --> Header
    app --> RouterProvider
    RouterProvider-. imported from .->react-router-dom;
    RouterProvider --> routes
    routes -- /invalid --> InvalidUrl
    routes -- / --> TodoListPage
    TodoListPage --> TodoList
    TodoList -- uses hook --> useTodos
    useTodos -- uses client --> TodoAPI
    TodoList --> AddItem
    TodoList -- 1..x --> TodoItem
    end

    TodoAPI -- HTTP requests --> API

    style react-oauth2-code-pkce fill:#f96;
    click react-oauth2-code-pkce "https://www.npmjs.com/package/react-oauth2-code-pkce" "Open"
    style react-router-dom fill:#f96;
    click react-router-dom "https://www.npmjs.com/package/react-router-dom" "Open"

    style useTodos fill:#b8c;
```

```plantuml
@startuml
skinparam rectangleBackgroundColor #White
skinparam defaultTextAlignment center

rectangle "web" {
  (index) --> (AuthProvider)
  (AuthProvider) --> (app)
  (app) --> (Header)
  (app) --> (RouterProvider)
  (RouterProvider) --> (routes)
  (routes) --> (InvalidUrl) : /invalid
  (routes) --> (TodoListPage) : /
  (TodoListPage) --> (TodoList)
  (TodoList) --> (useTodos) : uses hook
  (useTodos) --> (TodoAPI) : uses client
  (TodoList) --> (AddItem)
  (TodoList) --> (TodoItem) : 1..x
}

(AuthProvider) ..> [react-oauth2-code-pkce] : imported from
(RouterProvider) ..> [react-router-dom] : imported from
(TodoAPI) --> [API] : HTTP requests

note right of [react-oauth2-code-pkce] #FF9966
  [[https://www.npmjs.com/package/react-oauth2-code-pkce npm]]
end note

note right of [react-router-dom] #FF9966
  [[https://www.npmjs.com/package/react-router-dom npm]]
end note
@enduml
```

External dependencies:

- The app is using [react-oauth2-code-pkce](https://www.npmjs.com/package/react-oauth2-code-pkce) for Oauth2 authentication.
- The app is using [react-router-dom](https://www.npmjs.com/package/react-router-dom) for routing.

## Configuration

See [configuration](../../../../about/running/02-configure.md) for a description of the different configuration options available.

### Oauth2

The AuthProvider are using the configuration defined in `web/src/auth`.

```typescript
--8<-- "web/src/auth.ts"
```

### Routes

The RouterProvider are using the router defined in `web/src/router`.

```typescript
--8<-- "web/src/router.tsx"
```
