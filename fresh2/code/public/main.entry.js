require("../css/styles.less");

var docroot = require("docroot");

var Router = require("router");
var View = require("view42/v1");

var router = new Router({
	// log: true
});

var req = require.context("../", true, /\.tests\.js$/);

req.keys().forEach(function(key){
	// console.log(key);
	var path = key.replace(".tests.js", "");

	// var parts = path.split("/");
	// console.log(parts);

	var route = router.add(path).then(function(){
		req(key);
	});
});

docroot.append({
	router: router.routerView
});

router.matchAndActivate();