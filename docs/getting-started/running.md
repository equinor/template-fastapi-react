---
title: 4 Running
---

Running
=============

You can start running:

```shell
docker-compose up
```

The web app will be served at http://localhost

The API documentation can be found at http://localhost/docs

The OpenAPI spec can be found at http://localhost/openapi.json


<details>
<summary>Skip Docker (not recommended)</summary>

Navigate to the /api folder, activate local venv, then start backend app.py with Uvicorn:

```shell
cd api/src/  # go to the location of app.py
uvicorn app:create_app --reload
```

Navigate to the /web folder, and then start web application:

```shell
yarn start
```

</details>