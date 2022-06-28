Welcome
=============

How to get the boilerplate up and running on your local machine for development and testing purposes.

## The application

![web](/diagrams/web-application.png)

A todo demo implementation of a clean architecture in Python. The demo application exposes a REST API and works with one types of storage system: MongoDB. You can however add other databases such as in-memory database or Postgres.

![api](/diagrams/rest-api-documentation.png)

## Key technologies

Built with:

- FastAPI - the backend framework used
  - Using Clean Architecture
- React - the web framework used
  - Bootstrapped with create react app.

## Repository content

We are structure the software architecture to [scream](http://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html) the intent of the system therefore this project structure keeping most of the code inside the features folder.

```
├── api/ - backend code
├── api/
|   ├── src/
|   |   ├── autentication/
|   |   ├── common/
|   |   ├── entities/
|   |   ├── features/
|   |   ├── infrastructure/
|   |   ├── tests/
|   |   │   ├── unit/
|   |   │   ├── integration/
|   |   └── utils/
│── web/ - frontend code
│── docs/ - documentaiton
├── docker-compose.override.yml
├── docker-compose.yml
├── .env-template
└── ...
```

- `docker-compose.override.yml`-  for running in development mode locally
- `docker-compose.yml`: common settings
- `.env-template`:  environment variables

### API

- `entities/`: contains all entities, enums, exceptions, interfaces, types and logic specific to the domain layer
- `features/`: contains use-cases (application logic), repository interfaces, and controllers
- `infrastructure/`: contains classes for accessing external resources such as databases, file systems, web services, and repository implementations