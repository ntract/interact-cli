#!/usr/bin/env node

global.path = require("path");
global.fs = require("fs");

global._ = require("underscore"); //always useful
var underscoreDeepExtend = require("underscore-deep-extend");
_.mixin({deepExtend: underscoreDeepExtend(_)});

//file system glob handlers (very useful)
global.GlobCollection = require("buildkit-globber").GlobCollection;
global.TreeContext = require("buildkit-globber").TreeContext;
global.Tree = require("buildkit-globber").Tree;
global.WatchCollection = require("buildkit-globber").WatchCollection;
global.FileSystem = require("buildkit-globber").FileSystem;
global.Location = require("buildkit-globber").Location;
global.MATCH_TYPE = require("buildkit-globber").MATCH_TYPE;



console.log("Fixing permission...");


var origin = path.join(__dirname, "../../../");
origin.replace(/\\/g, "/");

var treecontext = new TreeContext();
var tree = treecontext.Tree(".", origin);
var paths = tree.mapGlobs([
	"**"
]);

for (var i = 0, l = paths.files.length; i < l; i ++) {
	fs.chmodSync(paths.files[i].location, 0777);
}

for (var i = 0, l = paths.dirs.length; i < l; i ++) {
	fs.chmodSync(paths.dirs[i].location, 0777);
}
