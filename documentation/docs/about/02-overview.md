# Overview

## Getting started

In order to start using this template for your own project, go to [equinor/template-fastapi-react](https://github.com/equinor/template-fastapi-react) and click the `Use this template` button to create a copy. 

Next, go-to the instructions on how-to [run locally](running/01-prerequisites.md) . 

For setting up a development environment, go to the [development guide](../contribute/development-guide/01-setup.md). Next, to start coding and extending the template see the [coding section](../contribute/development-guide/coding/01-architecture.md).

For starting contributing to the template see [contribute section](../contribute/01-how-to-start-contributing.md).
 
## Project structure

Here’s how the app is organized. 

```
├── api/ - backend code
│── web/ - frontend code
│── documentation/ - documentation
├── nginx/ - reverse proxy 
├── .env-template - template for environment variables
├── docker-compose.override.yml - for running locally
├── docker-compose.yml - common docker compose settings
└── ...
```