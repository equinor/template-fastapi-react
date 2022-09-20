---
title: Upgrading
---

Upgrading
=============

## Packages

{% info :warning: Remember to restart %}
Any changes you make to this files will only come into effect after you restart the
server. If you run the application using containers, you need to do `docker-compose build` and then `docker-compose up` to get the changes.
{% end %}

### API dependencies

```shell
cd api/
# Add or remove package to pyproject.toml
poetry update
```

### Web dependencies

```shell
cd web/
# Add or remove package to package.json
yarn instal
```







