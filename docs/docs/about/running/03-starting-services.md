# Starting services

You can start running:

```shell
docker compose up
```

The web app will be served at [http://localhost](http://localhost)

The API documentation can be found at [http://localhost/api/docs](http://localhost/api/docs)

The OpenAPI spec can be found at [http://localhost/api/openapi.json](http://localhost/api/openapi.json)

The supported development setup runs the services together through Docker Compose;
the web app's `/api` proxy depends on the Compose nginx service.
