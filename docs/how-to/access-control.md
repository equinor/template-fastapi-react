---
title: Access control
---

Access control
=============

Authentication (proof of identity) of users is done via Azure Active Directory(AAD).

Authorization (enforcement of an access policy) is done in the application, where AAD usernames are mapped to specific roles

To make use of this authentication pattern, you will need to:

* Create an app registration in AAD
  * Go to portal.azure.com and search for Azure Active Directory service and select `New registration`.
  * Redirect URIs: Select Single-page Application (SPA) and add minimum `http://localhost/`
* Get the app's client ID from AAD (also called application ID)
  * The client ID is used to tell Azure which resource a user is attempting to access






