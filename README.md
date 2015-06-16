# atom-package-reloader

reloades your atom packages on file change

![atom-package-reloader](https://cloud.githubusercontent.com/assets/1881921/8182233/b969fc1c-142d-11e5-9845-91a13374ba0c.png)


## Install

```sh
npm install --save-dev atom-package-reloader
```

## Usage

returns a `Function({pkg,folders})` if `atom.inDevMode()`


| options   | Type    | Usage                                   |
| --------: | ------- | :-------------------------------------- |
| pkg       | string  | name of your package |
| folders    | array | (optional) names of folders to watch defaults to '["lib"]' |


returns a object with three functions
| function   | Usage                                   |
| --------: |  :-------------------------------------- |
| `reload()` | manually reloads your package |
| `watchOnce()` | renews folder watchers |
| `dispose()` | manually dispose folder watchers |

`watchOnce` will be called automatically.
One file change `reload()` and `dispose()` will be called.

if not `atom.inDevMode()` `null` will be returned

## Example
Will only work in dev mode!
```coffee
# inside of your activation function
# delay is necessary to eliminate double execution
# try-catch is only necessary if you use it as a dev-dependecy
setTimeout (->
  reloaderSettings = pkg:"name-of-your-package",folders:["lib","styles"]
  try
    reloader ?= require("atom-package-reloader")(reloaderSettings)
  catch

  ),500

# inside of your deactivation function
reloader?.dispose()
reloader = null

```



## Release History

 - *v0.0.1*: First release

## License
Copyright (c) 2015 Paul Pflugradt
Licensed under the MIT license.
