---
title: Authentication and Authorization
---

Authentication and Authorization
=============

__Authentication__ is the act of validating that users are whom they claim to be.  
__Authorization__ is the process of giving the user permission to access a specific resource or function.

The template demo app is set up with OAuth2 authentication and no authorization (Any authenticated user can do anything).

There are 3 main parts that are important to understand in this authentication setup. The OAuth2 authentication server, the SPA web app, and the REST-API.

## The Authentication Server

There are many different _authentication providers_ (Keycloak, Azure, Google, Facebook, etc.), running their own implementation of the OAuth2 protocol. It is these servers' responsibility to have the user login and authenticate themselves. The authentication servers authenticate the users against their connected user database (e.g. Azure Active Directory).

If the user authenticate successfully, the auth server returns a __signed JSON Web Token__ (JWT).

In Equinor, Azure AD is the _go-to_ auth provider.
[This guide](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-register-spa) helps you register an "App" on Azure and configure it for use with a Web App.

## Single Page Web Application

Clients that has a goal of obtaining an access token (JWT), has many different _flows_/methods  to chose from. For Single Page Web Application the recommended flow is  the _Authorization Code flow with PKCE_.  
There are no resources to protect in the web app, therefore the job for the SPA in regards to authentication is simple;

  1. Is the user logged in?  
    a) No - Redirect user to authentication server for authentication  
    b) Yes - Add the JWT to every request to the API  

Details needed to implement this can be found here; https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow

We use the [react-oauth2-pkce](https://github.com/soofstad/react-oauth2-pkce) library to handle this for us.


## REST API

The REST API (e.g python FastAPI server) has access to, and is responsible for serving, data that could be private. Therefore we need to validate that the request is coming from an authenticated client.

We do that in these steps;  

  1. Require a JWT on each request
  2. Fetch the RSA public keys from the authentication server.
  3. Validate the JWT signature with the auth server's public key

FastAPI has system called [__dependencies__](https://fastapi.tiangolo.com/tutorial/dependencies) that is well suited for running a specific function before every request.

Here is an example;

```python
app = FastAPI(title="Awesome Boilerplate")  # Create the FastAPI app
routes.include_router(report_router)  # Add a route/controller to the app
# Add the 'auth_with_jwt()' function as a dependency
# This function will do the actual JWT validation with step 2 and 3
app.include_router(routes, dependencies=[Security(auth_with_jwt)])
```

That's it! Now every route added like this will require a successfull JWT validation before the request will be processed.

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
