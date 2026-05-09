# Local secrets

Files in this directory are read by `docker compose` as Docker secrets and
mounted into the relevant containers under `/run/secrets/`. None of them are
checked into git (see `.gitignore`).

Create the following files before running `docker compose up`:

| File                              | Used by   | How to generate                                                                          |
| --------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `OAUTH2_CLIENT_SECRET.txt`        | `oauth2`  | Client secret of the Azure AD app registration backing the BFF.                          |
| `OAUTH2_PROXY_COOKIE_SECRET.txt`  | `oauth2`  | `python -c "import os, base64; print(base64.urlsafe_b64encode(os.urandom(32)).decode())"`|
| `REDIS_PASSWORD.txt`              | `oauth2`, `cookie-cache` | Any random string, e.g. `openssl rand -hex 32`.                            |

The file contents must not contain a trailing newline. Use `printf` instead of
`echo`, or strip the newline afterwards:

```sh
printf '%s' "$(openssl rand -hex 32)" > secrets/REDIS_PASSWORD.txt
```
