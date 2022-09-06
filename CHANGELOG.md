# Changelog

## 1.0.0 (2022-09-06)


### Features

* add auth ([a201f13](https://github.com/equinor/template-fastapi-react/commit/a201f138ee5a02218b5e4b2b08b0f00f88bb5dd3))
* add axios ([88448c2](https://github.com/equinor/template-fastapi-react/commit/88448c2d52007d68651a26d46c6672369172698a))
* add equinor design system ([b96d4da](https://github.com/equinor/template-fastapi-react/commit/b96d4dae0ec65f4938d862bc8bbf079cb5950ae4))
* add equinor typeface ([53a7423](https://github.com/equinor/template-fastapi-react/commit/53a742398782a9452bc61127d62f408a840dfb5a))
* add eslint to pre-commit ([20c872d](https://github.com/equinor/template-fastapi-react/commit/20c872da056b89e038bd87c79e2fcd40bab85cf9))
* Add extra checks to pre-commit and run safety in venv ([27a6cbe](https://github.com/equinor/template-fastapi-react/commit/27a6cbe7bea4843a70947fdcf5ba73f1dd5af871))
* add flake8, safety and pytests to pre-commit ([1917997](https://github.com/equinor/template-fastapi-react/commit/1917997411b7a1f1844c3463388005576d8acc77))
* add mypy type checking to pre-commit ([437cedd](https://github.com/equinor/template-fastapi-react/commit/437cedd17cb86165448526fd8011730f4dbe03b6))
* add prettier ([b1ce63a](https://github.com/equinor/template-fastapi-react/commit/b1ce63a700471c54b75e5f58c35d0d3ccabdf0d5))
* autogenerate release changelog ([e463ae2](https://github.com/equinor/template-fastapi-react/commit/e463ae2e2694358936802e9fbf6dc3a7cfca846d))
* build and push images in ci ([477ad85](https://github.com/equinor/template-fastapi-react/commit/477ad8564bc92105b990715cc0bebeb5c7aff4d8))
* create-react-app with typescript and equinor icons ([2cfa523](https://github.com/equinor/template-fastapi-react/commit/2cfa523e2e1df8ebe0fa3b003fc6936d1bebaa13))
* init todo example ([8beaf08](https://github.com/equinor/template-fastapi-react/commit/8beaf084352f16c8715ebe6f77b40d30450d2e04))
* official nginx image running unprivileged ([fab0c14](https://github.com/equinor/template-fastapi-react/commit/fab0c1445920ae5c0cb0eb05308b6a223aed3de8))
* pre-commit in CI from pre-commit-config.yaml ([5d806b5](https://github.com/equinor/template-fastapi-react/commit/5d806b5bd1ceda039670dd3b30ef19de49519a16))
* **pre-commit:** Add autoflake to pre-commits ([8d97b34](https://github.com/equinor/template-fastapi-react/commit/8d97b34f7eeb90b00c0c5d2410b820af259ce7b1)), closes [#31](https://github.com/equinor/template-fastapi-react/issues/31)
* response decorator takes Response type as parameter ([9a7f228](https://github.com/equinor/template-fastapi-react/commit/9a7f2287f9bac7e0f68f916c37b4273dc8b95d9b))
* reusable gh actions workflows ([d557ebc](https://github.com/equinor/template-fastapi-react/commit/d557ebc8438a4b28d83d2f40d8a7aa2991db1197))
* show changelog in documentation ([6da9b86](https://github.com/equinor/template-fastapi-react/commit/6da9b86770ffca6431f16b945680a87637268497))
* tutorial on authentication ([fd789c0](https://github.com/equinor/template-fastapi-react/commit/fd789c0d7bd3dda1e1ce0ee78ee9c73c4670fe41))


### Bug Fixes

* add missing decorators ([54fd2f8](https://github.com/equinor/template-fastapi-react/commit/54fd2f8a3826d2a5bc5bbc7419cbdd83de4811f1))
* add required additional dependecies to eslint pre-commit env ([cca8509](https://github.com/equinor/template-fastapi-react/commit/cca8509bf7a4edc5c38ad5fe3a7b0812fdb95040))
* add venv ([d682b08](https://github.com/equinor/template-fastapi-react/commit/d682b0817d735547f3a3cd7391d942983cbf666c))
* cast variable that cannot be undefined to boolean ([372f781](https://github.com/equinor/template-fastapi-react/commit/372f781d805d25f2e7aaa284d3b70622989e9136))
* **dev:** env_file in docker-compose.override.yml (PR [#39](https://github.com/equinor/template-fastapi-react/issues/39)) ([2aa80bd](https://github.com/equinor/template-fastapi-react/commit/2aa80bdfc211f44d624f1cdad4f8b0844164c4bf))
* disable pull ([de2d045](https://github.com/equinor/template-fastapi-react/commit/de2d04530a511a798fb757e85cb07872f0dfb129))
* duplicated pre-commit hook ([a21f5a6](https://github.com/equinor/template-fastapi-react/commit/a21f5a69ba1ea3a10371f48071ef2de8b3d56448))
* fix mypy errors ([d9543c1](https://github.com/equinor/template-fastapi-react/commit/d9543c187859de7fad59f91b79eaa4f63a56a1c6))
* fix pytest_plugin import error ([b521819](https://github.com/equinor/template-fastapi-react/commit/b5218196028c904e6a51d9a0971d7637264c87a2))
* lock cryptography dependency since a bad new release. Set authentication scheme to allow for no tokens. Exclude some file from pre-commit ([ea6a931](https://github.com/equinor/template-fastapi-react/commit/ea6a9314482ca75d8d79c999959460b17ceec754))
* move Response decorator to controllers ([bd36b4a](https://github.com/equinor/template-fastapi-react/commit/bd36b4a316f6a2c1216584235eb5dd462f6d0707))
* only run safety hook once ([bc33372](https://github.com/equinor/template-fastapi-react/commit/bc33372bd57d7b8710cd7460f1c18c6b55c38634))
* poetry command ([ccbb2e1](https://github.com/equinor/template-fastapi-react/commit/ccbb2e10845f9cf3215e5e95fd07f21c3b108249))
* pre-commit ([5192d0e](https://github.com/equinor/template-fastapi-react/commit/5192d0e79e433cf925d0569a237a101f77b68c5b))
* python-version ([a934109](https://github.com/equinor/template-fastapi-react/commit/a9341092771e81aced0ed4481eb582785dd08113))
* remove encryption.py ([a500444](https://github.com/equinor/template-fastapi-react/commit/a500444b936bcc99bdcd73ebdc6eb9eeb5de2ac3))
* set correct base path for docs ([0dda0b2](https://github.com/equinor/template-fastapi-react/commit/0dda0b23b94155f1eb6cd194d31af1f9265ecd2b))
* set correct type on todo local state ([2a4020c](https://github.com/equinor/template-fastapi-react/commit/2a4020ce9f84affb1725f4e4b476dc1c20b67b0e))
* turn off eslint rules that are unnecessary or might conflict with prettier ([d6beaf7](https://github.com/equinor/template-fastapi-react/commit/d6beaf7426821d5bb5efd68fe6407d13ee1d38d5))
* typo ([fb557b8](https://github.com/equinor/template-fastapi-react/commit/fb557b8adb56fc0d5aa430a1d505d1066be1ed13))
* use const on variable that is never reassigned ([9f7c543](https://github.com/equinor/template-fastapi-react/commit/9f7c54304385c49123a3d436b5cce66997ab1e62))
* **web:** correct base path ([a3872d5](https://github.com/equinor/template-fastapi-react/commit/a3872d5c67f1764c28d7450e9bf4c350cc0e87b6))
* yarn build again ([dfc48fd](https://github.com/equinor/template-fastapi-react/commit/dfc48fda537d152974a9610e3263245c69346768))
