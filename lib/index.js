(function() {
  var recursiveDelete;

  recursiveDelete = function(children) {
    var child, i, len;
    for (i = 0, len = children.length; i < len; i++) {
      child = children[i];
      if (((child != null ? child.id : void 0) != null) && (require.cache[child.id] != null)) {
        children = require.cache[child.id].children;
        if (children != null) {
          recursiveDelete(children);
        }
        delete require.cache[child.id];
      }
    }
    return null;
  };

  module.exports = function(arg) {
    var Directory, dispose, folders, pkg, pkgPath, reload, reloading, rootDir, watchOnce, watchers;
    pkg = arg.pkg, folders = arg.folders;
    if (pkg == null) {
      throw new Error("no pkg provided");
    }
    if (!atom.inDevMode()) {
      return null;
    }
    if (folders == null) {
      folders = ["lib"];
    }
    watchers = [];
    dispose = function() {
      var i, len, watcher;
      for (i = 0, len = watchers.length; i < len; i++) {
        watcher = watchers[i];
        watcher.dispose();
      }
      return watchers = [];
    };
    pkgPath = atom.packages.resolvePackagePath(pkg);
    Directory = require('atom').Directory;
    rootDir = new Directory(pkgPath);
    reloading = false;
    reload = function() {
      var deps, i, id, len, mainPath, module, pkgModel, ref, ref1;
      if (reloading) {
        return null;
      }
      console.log(pkg + " - reloading");
      reloading = true;
      dispose();
      pkgModel = atom.packages.getLoadedPackage(pkg);
      mainPath = pkgModel.mainModulePath;
      pkgModel.deactivate();
      pkgModel.mainModuleRequired = false;
      pkgModel.reset();
      if (require.cache[mainPath] != null) {
        recursiveDelete(require.cache[mainPath].children);
        delete require.cache[mainPath];
      }
      deps = [];
      ref = require.cache;
      for (id in ref) {
        module = ref[id];
        if (id.indexOf(pkgPath) > -1 || id.indexOf("atom-package-reloader") > -1) {
          deps.push(id);
        }
      }
      for (i = 0, len = deps.length; i < len; i++) {
        id = deps[i];
        recursiveDelete((ref1 = require.cache[id]) != null ? ref1.children : void 0);
        delete require.cache[id];
      }
      pkgModel.load();
      return pkgModel.activate();
    };
    watchOnce = function() {
      var folder, i, len, results;
      dispose();
      results = [];
      for (i = 0, len = folders.length; i < len; i++) {
        folder = folders[i];
        results.push(watchers.push(rootDir.getSubdirectory(folder).onDidChange(reload)));
      }
      return results;
    };
    watchOnce();
    return {
      reload: reload,
      watchOnce: watchOnce,
      dispose: dispose
    };
  };

}).call(this);
