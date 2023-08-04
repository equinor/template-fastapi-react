---
sidebar_position: 4
---

# Securing endpoints

The REST API (i.e. python FastAPI server) has access to, and is responsible for serving, data that could be private. Therefore we need to validate that the request is coming from an authenticated client.

We do that in these steps;  

  1. Require a JWT on each request
  2. Fetch the RSA public keys from the authentication server.
  3. Validate the JWT signature with the auth server's public key

FastAPI has system called [__dependencies__](https://fastapi.tiangolo.com/tutorial/dependencies) that is well suited for running a specific function before every request.

Here is an example;

```python
routes = APIRouter()
app = FastAPI(title="Awesome Boilerplate")  # Create the FastAPI app
app.include_router(routes)  # Add a route/controller to the app
# Add the 'auth_with_jwt()' function as a dependency
# This function will do the actual JWT validation with step 2 and 3
app.include_router(routes, dependencies=[Security(auth_with_jwt)])
```

That's it! Now every route added like this will require a successful JWT validation before the request will be processed.

Dependencies can also return values, useful if you need to do some kind of __authorization__.  
Here is one example;

```python
@router.delete("/{id}", operation_id="delete-report")
def delete_report(id: str, user: User = Depends(auth_with_jwt)):
    if has_permission(user):
      delete_report(id)
      return "OK"
    else:
      return PlainTextResponse("Permission denied", status_code=402)
```

