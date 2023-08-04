# Changelog

## [1.4.0](https://github.com/equinor/template-fastapi-react/compare/v1.3.0...v1.4.0) (2023-03-01)


### Features

* Add info popover with version ([28aa513](https://github.com/equinor/template-fastapi-react/commit/28aa51377592b7c5bb9b59d245ab275b47a52653)), closes [#154](https://github.com/equinor/template-fastapi-react/issues/154)


### Bug Fixes

* add error handling of version file fetch ([a4f6889](https://github.com/equinor/template-fastapi-react/commit/a4f68897e446ebb4ebd91f58110bfa403df53fc9))
* **api:** handle lists in create_response ([333f7d4](https://github.com/equinor/template-fastapi-react/commit/333f7d4afbac95609ae15b05b3a8f1d978ee1107))
* **api:** make health-check return PlainTextResponse ([12d5169](https://github.com/equinor/template-fastapi-react/commit/12d51697ee78edbbe519c874b4fddfb8f0786718))
* **api:** remove empty default pydantic field in models ([0424282](https://github.com/equinor/template-fastapi-react/commit/0424282f7dee8662c6d0b8faa01f78bdaced3a3f))
* remove /api as root path. ([208ceb9](https://github.com/equinor/template-fastapi-react/commit/208ceb98dcf269e18b43d6ffda04dd265bfe868c))
* replace deprecated output definition ([c53b003](https://github.com/equinor/template-fastapi-react/commit/c53b003498afb8f2568815a4c3da56f8d15542af))


### Tests

* Upgrade pre-commits ([bd8f110](https://github.com/equinor/template-fastapi-react/commit/bd8f1106cde2ec215ea9a519a4afd5daa460fb96))


### Build System

* add typescript plugin ([83ade0c](https://github.com/equinor/template-fastapi-react/commit/83ade0cdb86d15bbe072e036fbe0ac1b106f8015))
* **ci/cd:** update flake8 repo location ([e6953ad](https://github.com/equinor/template-fastapi-react/commit/e6953ad3ca280975c9589939a1e728a73fbfd418))
* enable scripts to build necessary packages (YN0007) ([f1cf2c3](https://github.com/equinor/template-fastapi-react/commit/f1cf2c3f7d6fc7190535c8abf97c55bfa6839e56))
* missing peer dependencies (YN0002) ([9e8981d](https://github.com/equinor/template-fastapi-react/commit/9e8981d581c2509039beda4a7a34980c574bf179))
* set yarn version ([afb5834](https://github.com/equinor/template-fastapi-react/commit/afb5834883d6d1f01026d602fb434db38443c8b0))


### Miscellaneous Chores

* Add yarn upgrade-interactive ([91d998f](https://github.com/equinor/template-fastapi-react/commit/91d998f317d8b697a75a920108a94e5479b13f78))
* **api:** return Pydantic model instead of dict ([427a963](https://github.com/equinor/template-fastapi-react/commit/427a9633d31cc3298d463fc4f1a225bd36f76867))
* ignore diffs on yarn plugins ([78017e5](https://github.com/equinor/template-fastapi-react/commit/78017e5216f863b19842e09574bf035db78f88de))
* remove empty catch ([0264cb5](https://github.com/equinor/template-fastapi-react/commit/0264cb5960dfee0cfb36dcf1e9ebbd099ddac51e))
* remove redundant conditional ([925d5b4](https://github.com/equinor/template-fastapi-react/commit/925d5b4a5391b39acfc6e639ee9a47a676697ebb))
* type CommitInfo ([2179e13](https://github.com/equinor/template-fastapi-react/commit/2179e13f256cba46959c101f76593f262daee5d4))
* Update all web packages ([a193af5](https://github.com/equinor/template-fastapi-react/commit/a193af56c4e0ed68be9b7ad05d7a5747130c0321))
* update dependencies ([fb2cf50](https://github.com/equinor/template-fastapi-react/commit/fb2cf508f3f30f12bf39f23a9a630d92e12f47b0))
* update sdks ([385a55e](https://github.com/equinor/template-fastapi-react/commit/385a55eefab23b695e2a4f1f12b1ca97e93a9820))
* upgrade versions ([bc9f6a3](https://github.com/equinor/template-fastapi-react/commit/bc9f6a3dadb920167419e8b66bd79a396c09cad9))
* upgrade versions ([041f78e](https://github.com/equinor/template-fastapi-react/commit/041f78e9c0cdb1be8fd83099d33b7c1e36e3633a))


### Code Refactoring

* **api:** replace response_class with return type annotations ([b1fa3bd](https://github.com/equinor/template-fastapi-react/commit/b1fa3bd6b342ba89e5d2237721573a83cfd503fe))
* **ci:** extract ghcr login into separate step ([0d90fe0](https://github.com/equinor/template-fastapi-react/commit/0d90fe00438ad9c995198cba8e268c8268af1e4a))
* **ci:** remove crazy-max external action ([b41990d](https://github.com/equinor/template-fastapi-react/commit/b41990d92c19d2a661900a208a60d604a5ab470c))
* create empty yarn.lock ([39050e7](https://github.com/equinor/template-fastapi-react/commit/39050e72af50debd95380590fe4ee803a5995589))
* separate responsibilities by moving useEffect to a custom hook ([cc33a5d](https://github.com/equinor/template-fastapi-react/commit/cc33a5d1f856aff8e529c4c3df43d326fb5a8a90))
* **workflow:** Fix linting errors ([8ea9f69](https://github.com/equinor/template-fastapi-react/commit/8ea9f69fbb5919568ba99fed659be77e18647d48))
* **workflow:** rename and restructure workflows ([f08fffa](https://github.com/equinor/template-fastapi-react/commit/f08fffaf7ffaf46503debfc4e4bd60320592a84e))


### Continuous Integration

* Add rollback workflow ([b1cca70](https://github.com/equinor/template-fastapi-react/commit/b1cca70e53c7080427979b3efe0ee30ccffafdd0)), closes [#153](https://github.com/equinor/template-fastapi-react/issues/153)
* allow publishing multiple tags at once ([4c5d867](https://github.com/equinor/template-fastapi-react/commit/4c5d8677395054254551757f871570dad1695933)), closes [#153](https://github.com/equinor/template-fastapi-react/issues/153)
* bump pre-commit hooks ([9a0cea7](https://github.com/equinor/template-fastapi-react/commit/9a0cea7d6a03aaa99101135f626b948c87dd6882))
* change oauth redurect url to radix playground ([655c55f](https://github.com/equinor/template-fastapi-react/commit/655c55f5027baea255d29ea881df0030695da5aa))
* Change version logging format on build ([49ca893](https://github.com/equinor/template-fastapi-react/commit/49ca8939a6dd8fd753ba171653a5977a869a0249)), closes [#154](https://github.com/equinor/template-fastapi-react/issues/154)
* correct permissions ([6d9d563](https://github.com/equinor/template-fastapi-react/commit/6d9d563a3cf3db335c1d34b3630ac64212881186))
* Fix bug in publish docs ([a696a33](https://github.com/equinor/template-fastapi-react/commit/a696a33a9e451f3d261e2b07538aebac418ac3d3))
* Include all commit types in changelog ([73cfaaa](https://github.com/equinor/template-fastapi-react/commit/73cfaaadf916c7e15accb347183f89e50651f279))
* login as the service principal to request an access token ([fabe3b4](https://github.com/equinor/template-fastapi-react/commit/fabe3b469ce49f9c64ff3e0781d6564c78f709f5))
* pass tag name to publish-image workflow ([dcedc16](https://github.com/equinor/template-fastapi-react/commit/dcedc16f6ab2d16d74f4c41ffaf4100f638b88dc)), closes [#153](https://github.com/equinor/template-fastapi-react/issues/153)
* remove secret as input to reusable workflow ([1ec6cbb](https://github.com/equinor/template-fastapi-react/commit/1ec6cbb2e5360de99d99416739093a02a38c5ba7))
* specify playground context ([142bc13](https://github.com/equinor/template-fastapi-react/commit/142bc139c4cd4b7e145a00dde2161a502afa9363))


### Documentation

* add what is fastapi ([bbec23b](https://github.com/equinor/template-fastapi-react/commit/bbec23b85d2b0c1fadfd4e4ea6e3df7e63683e78))
* **ci:** add comment to azure login ([f6b9c96](https://github.com/equinor/template-fastapi-react/commit/f6b9c962d23a7eb2832e14b1d37d9e8b14419f5d))
* rewrite 01-setup Yarn PnP in VSCode ([df4c7d0](https://github.com/equinor/template-fastapi-react/commit/df4c7d0dadbbccaafa6fa5c13d0bd3b16faf5243))
* update link to radix playground ([6c932c3](https://github.com/equinor/template-fastapi-react/commit/6c932c3c48739bce3cc21e24a416405a64e5cc31))

## [1.3.0](https://github.com/equinor/template-fastapi-react/compare/v1.2.1...v1.3.0) (2022-11-11)


### Features

* allow each user to have their own todos ([9456ab8](https://github.com/equinor/template-fastapi-react/commit/9456ab84f5f5e0b804bd0011037ee72d7da49fbb))


### Bug Fixes

* add missing dependency without causing infinite loop of rerendering ([8f5c01d](https://github.com/equinor/template-fastapi-react/commit/8f5c01d5141c4dbd4ac9b99ebc39ae10f378147f))
* **api:** raise MissingPrivilegeException when relevant ([0c55af3](https://github.com/equinor/template-fastapi-react/commit/0c55af393a4ffc189a068c821545261eb10ef7d4))
* **api:** raise MissingPrivilegeException when relevant ([613cc42](https://github.com/equinor/template-fastapi-react/commit/613cc4257699ddb1c2a772b54f28ccec84f2778b))
* make todo title required, not optional ([bc8dab6](https://github.com/equinor/template-fastapi-react/commit/bc8dab62079ded3e87c1113e81f1cd9911ad1a65))
* only allow users to delete their own todos ([1cf1e7a](https://github.com/equinor/template-fastapi-react/commit/1cf1e7a8eefac27552dcdc9df0a30cf59c042eab))
* test suite ([31da3f7](https://github.com/equinor/template-fastapi-react/commit/31da3f7e720d0838e59e280aa4d873b44e24cecb))
* **tests:** fix up integration tests with per-user todos ([b7cc0ca](https://github.com/equinor/template-fastapi-react/commit/b7cc0caa51535020bb329c7c21cde4b458baa81c))

## [1.2.1](https://github.com/equinor/template-fastapi-react/compare/v1.2.0...v1.2.1) (2022-11-09)


### Bug Fixes

* **web:** adding todo item now clears input. ([82e6f6b](https://github.com/equinor/template-fastapi-react/commit/82e6f6baee06ccbd50c4d59fe7a9a97a4b1df094))

## [1.2.0](https://github.com/equinor/template-fastapi-react/compare/v1.1.1...v1.2.0) (2022-11-09)


### Features

* expand and visualize auth states ([51c9870](https://github.com/equinor/template-fastapi-react/commit/51c9870bc657d586464780c664aeb6edb49b5ba2))
* **web:** clear input on add-todo ([d61adc1](https://github.com/equinor/template-fastapi-react/commit/d61adc16ea35a25b2d556b61b9d1cf710de41e8e))
* **web:** visualize loading state better ([6a6ab81](https://github.com/equinor/template-fastapi-react/commit/6a6ab81bec55bf79aeda5a07e8eff5cdd84b4ab5))


### Bug Fixes

* make useTodos simpler to use ([e8f0a18](https://github.com/equinor/template-fastapi-react/commit/e8f0a1866c594ca0a526bac3ae3e5a1f8551a005))

## [1.1.1](https://github.com/equinor/template-fastapi-react/compare/v1.1.0...v1.1.1) (2022-11-04)


### Bug Fixes

* resolve PR feedback ([bd3debe](https://github.com/equinor/template-fastapi-react/commit/bd3debe820f27ebf7d892ecbda77720fc66be06b))

## [1.1.0](https://github.com/equinor/template-fastapi-react/compare/v1.0.0...v1.1.0) (2022-11-04)


### Features

* standardized ErrorResponse model ([c09e4dc](https://github.com/equinor/template-fastapi-react/commit/c09e4dccf5abd62fa05e9b1c0a577ea72d0129c4))


### Bug Fixes

* add types to fixtures ([0528e5b](https://github.com/equinor/template-fastapi-react/commit/0528e5beb9bec905cedee1db2af3b2a5248fe85d))
* delete non existing item should return 404 ([4341416](https://github.com/equinor/template-fastapi-react/commit/43414160eef1bee7ff2ea44c7c9f99e041ccc977))

## 1.0.0 (2022-09-07)


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
* add required additional dependencies to eslint pre-commit env ([cca8509](https://github.com/equinor/template-fastapi-react/commit/cca8509bf7a4edc5c38ad5fe3a7b0812fdb95040))
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
