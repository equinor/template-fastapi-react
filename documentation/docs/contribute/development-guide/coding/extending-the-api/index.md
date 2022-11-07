---
sidebar_position: 2
---

# Extending the API

The API is grouped by features.

![Features](/img/features.png)

## Codebase structure

The API has a feature-based folder structure following the principles of [Clean Architecture](../01-architecture.md). 

```
├── api/
│   └── src/
│       ├── common/
│       ├── entities/ 
│       ├── features/ 
│       │   ├── health_check/
│       │   ├── todo/
│       │   ├── whoami/
│       │   └── ...
│       ├── data_providers/
│       └── tests/
│           ├── unit/
│           └── integration/       
└── ...
```

- `common` contains shared code like authentication, exceptions, response decorator
- [`entities`](02-adding-entities.md) contains all entities, enums, exceptions, interfaces, types and logic specific to the domain layer
- [`features`](adding-features) contains use-cases (application logic), repository interfaces, and controllers
- [`data providers`](adding-data-providers) contains classes for accessing external resources such as databases, file systems, web services, and repository implementations
- `tests` contains unit and integrations tests 

## Get started 

1. Create the domain model by [adding entities](02-adding-entities.md)
2. Extend the API by [adding features](adding-features)
   * Add a [use case](adding-features/02-use-cases.md) to handle application logic 
   * Add a [controller](adding-features/01-controllers.md) to handle API requests
      * Add an endpoint to the controller that executes the use case
3. Add a data provider, [repository interface](adding-data-providers/02-repository-interfaces.md) and [repository](adding-data-providers/03-repositories.md) to handle communication to external services such as databases.


:::note

Entities and data providers can be shared between features (the entrypoints and use-cases).

:::