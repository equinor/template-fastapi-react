# Adding data providers

Data providers are part of the infrastructure layer, which is responsible for external infrastructure communications
like database storage, file system, and external systems. The infrastructure layer is the layer that contains all the
concrete implementations of the application. It implements interfaces defined in use cases, to provide access to
external systems.

```
├── data_providers/
│   ├── clients/ 
│   ├── repository_interfaces/ 
│   └── repositories/
└── ...
```

w