### 0.8.4 (2015-01-29)


#### Bug Fixes

* **binding-language:** string interpolation renders empty string for number 0 ([9eff937a](http://github.com/aurelia/templating-binding/commit/9eff937a3e2ff1181825a76bef9025e5c431f3ac), closes [#3](http://github.com/aurelia/templating-binding/issues/3))


### 0.8.3 (2015-01-25)


#### Bug Fixes

* **interpolation-binding:** errors on undefined or null expression eval ([212a13d0](http://github.com/aurelia/templating-binding/commit/212a13d0a13f947e0974e1380af7a3eb82b679eb))


### 0.8.2 (2015-01-24)


#### Bug Fixes

* **package:** update deps and fix bower semver ranges ([a9bffa70](http://github.com/aurelia/templating-binding/commit/a9bffa70605ff2e9881669cae574e7b005363e00))


### 0.8.1 (2015-01-23)


#### Bug Fixes

* **binding-language:** interpolation bindings should support value converters ([95045ac3](http://github.com/aurelia/templating-binding/commit/95045ac337ae22f97901e71224edc5a67be4a42c))


## 0.8.0 (2015-01-22)


#### Bug Fixes

* **binding-language:** fix non-default binding mode overwrites ([8b49ae59](http://github.com/aurelia/templating-binding/commit/8b49ae59fcd75f60d329ffafd8b36b5081925162))
* **package:** update dependencies ([f8927df5](http://github.com/aurelia/templating-binding/commit/f8927df5959800cfbffb3ce90d11ab02aad4be06))
* **syntax-interpreter:** incorrect string interpolation syntax ([5bf69639](http://github.com/aurelia/templating-binding/commit/5bf69639e6d81be1bb8be61d6a44e854c2306357))


#### Features

* **syntax-interpreter:**
  * enable dynamic commands ([880cc153](http://github.com/aurelia/templating-binding/commit/880cc1531fc09efa0dec9fa88f08d80691580364))
  * use provided default bindings for .bind ([b59c3f21](http://github.com/aurelia/templating-binding/commit/b59c3f2182926c4e89fed57216b5c4dd42c5a778))


### 0.7.2 (2015-01-12)


#### Bug Fixes

* **all:** use attributeMap to map class and for to property names ([c6671d53](http://github.com/aurelia/templating-binding/commit/c6671d53d67b0d82e21be7a35cf4eb91880f5993))


### 0.7.1 (2015-01-12)


#### Bug Fixes

* **syntax-interpreter:** use inspected attribute value for options ([4916ac3f](http://github.com/aurelia/templating-binding/commit/4916ac3f40372d3bd929b7155cd4d2501849f483))


## 0.7.0 (2015-01-12)


#### Bug Fixes

* **all:** typos in binding language and options syntax ([17f91fe0](http://github.com/aurelia/templating-binding/commit/17f91fe0860c5bbf6aeb4a9a970139cf6be3b4b0))
* **package:** update Aurelia dependencies ([b07b1f85](http://github.com/aurelia/templating-binding/commit/b07b1f850309dfbc6ca556a2c57449cf46ee6c0f))
* **syntax-interpreter:** handle non bound options values ([c13d9dd9](http://github.com/aurelia/templating-binding/commit/c13d9dd92f594510e1585a0afd98178a8fa0e739))


#### Features

* **binding-language:**
  * new binding language interface ([4fae8ad8](http://github.com/aurelia/templating-binding/commit/4fae8ad893d1e3e3a6ea43e9aa9b2d2ea2e944f4))
  * new syntax for element refs ([a24d5967](http://github.com/aurelia/templating-binding/commit/a24d5967c95e6a322980817dee6a7eae4defc3a3))


## 0.6.0 (2015-01-07)


#### Bug Fixes

* **package:** update dependencies to latest ([5f5fae4a](http://github.com/aurelia/templating-binding/commit/5f5fae4ab282e072e26f1e4b1da734cf2522611b))


## 0.5.0 (2015-01-06)


#### Bug Fixes

* **all:** rename Filter to ValueConverter ([e0753f5c](http://github.com/aurelia/templating-binding/commit/e0753f5c1cdc26b207f951501f8444c10a00195c))
* **index:** fix compiler error in plugin install function ([7d1de765](http://github.com/aurelia/templating-binding/commit/7d1de765e2aef5ffd688f40bb291a4fa87f0dfc3))


#### Features

* **binding-language:** enable usage as plugin ([0900eb76](http://github.com/aurelia/templating-binding/commit/0900eb76519c35c3f7eedeecde6b2db71b9bb972))
* **build:** update compiler and switch to register module format ([219e215b](http://github.com/aurelia/templating-binding/commit/219e215b8f7b3574f466e3eaa14c0b911981d8c6))
* **syntax-interpreter:** support call expression and name binding modes ([97b4a83f](http://github.com/aurelia/templating-binding/commit/97b4a83ff5d5a9a36edb278486c58a23ad5a2b94))


## 0.4.0 (2014-12-22)


#### Bug Fixes

* **package:** update the templating dependency to latest ([5e12d55a](http://github.com/aurelia/templating-binding/commit/5e12d55a69ae7bf354daa67810abae01aee8a0aa))


### 0.3.2 (2014-12-18)


#### Bug Fixes

* **package:** update templating to latest version ([28bfb5c8](http://github.com/aurelia/templating-binding/commit/28bfb5c8889e72d883cc423ea8a04a88a0fb2582))


### 0.3.1 (2014-12-18)


#### Bug Fixes

* **package:** update templating to latest version ([ae5ed8e1](http://github.com/aurelia/templating-binding/commit/ae5ed8e1b249e8edb9fa8a2586898f08b51c13d9))


## 0.3.0 (2014-12-17)


#### Bug Fixes

* **package:** update dependencies to latest versions ([f7e960fa](http://github.com/aurelia/templating-binding/commit/f7e960fa3ba4c706a2a02b47be593105b705f647))


### 0.2.1 (2014-12-12)


#### Bug Fixes

* **package:** update dependencies to latest ([b5379b2a](http://github.com/aurelia/templating-binding/commit/b5379b2ac85dd99796bba8e2388533daa5907fcb))
* **syntax:** delegate and trigger now prevent default actions ([7d6be6d4](http://github.com/aurelia/templating-binding/commit/7d6be6d486ec210ce3ee0c22dcc72b057e8d2898))


## 0.2.0 (2014-12-11)


#### Bug Fixes

* **package:** update dependencies to latest versions ([5c07af5b](http://github.com/aurelia/templating-binding/commit/5c07af5bbdee818533c04ef8dccad192eaad846a))

