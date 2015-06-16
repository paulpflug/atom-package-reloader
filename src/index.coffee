# out: ../lib/index.js


recursiveDelete = (children) ->
  return unless children? and children.length?
  for child in children
    if child?.id? and require.cache[child.id]?
      children = require.cache[child.id].children
      recursiveDelete children if children?
      delete require.cache[child.id]
  null



module.exports = ({pkg,folders}) ->
  throw new Error "no pkg provided" unless pkg?
  return null unless atom.inDevMode()
  folders ?= ["lib"]
  watchers = []
  dispose = ->
    watcher.dispose() for watcher in watchers
    watchers = []
  pkgPath = atom.packages.resolvePackagePath(pkg)
  {Directory} = require 'atom'
  rootDir = new Directory(pkgPath)
  reloading = false
  reload = ->
    return null if reloading
    console.log "#{pkg} - reloading"
    reloading = true
    dispose()
    pkgModel = atom.packages.getLoadedPackage(pkg)
    mainPath = pkgModel.mainModulePath
    pkgModel.deactivate()
    pkgModel.mainModuleRequired = false
    pkgModel.reset()
    if require.cache[mainPath]?
      recursiveDelete require.cache[mainPath].children
      delete require.cache[mainPath]
    deps = []
    for id, module of require.cache
      if id.indexOf(pkgPath) > -1 or id.indexOf("atom-package-reloader") > -1
        deps.push id
    for id in deps
      recursiveDelete require.cache[id]?.children
      delete require.cache[id]
    pkgModel.load()
    pkgModel.activate()
  watchOnce = ->
    dispose()
    for folder in folders
      watchers.push rootDir.getSubdirectory(folder).onDidChange reload
  watchOnce()
  return {reload:reload,watchOnce:watchOnce,dispose:dispose}
