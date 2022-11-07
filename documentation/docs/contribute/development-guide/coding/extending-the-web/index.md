---
sidebar_position: 3
---

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
- `hooks` contains re-usable hooks
- `pages` contains entrypoints (pages that are used by the router)