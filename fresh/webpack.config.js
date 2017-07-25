var globule = require("globule");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

// all LESS stylesheets, imported via require("./something.less"), 
// will be bundled into a single /code/public/styles.css
var extractLESS = new ExtractTextPlugin("styles.css");

// create an entry point for any file ending in 'entry.js'
var entry = {};

var files = globule.find("./code/public/**/*entry.js").forEach(function(filePath){
	var entryName = filePath
			.replace("entry.js", "")
			.replace("./code/public", "");

	entry[entryName] = filePath;
	console.log("entryName", entryName, filePath);
});

module.exports = {
	devtool: "inline-source-map",
	entry: "./code/public/main.entry.js",
	output: {
		path: __dirname+"/code/public",
		filename: "main.bundle.js"
	},
	module: {
		loaders: [
			{
				test: /\.less$/,
				loader: extractLESS.extract("css-loader?sourceMap!less-loader?sourceMap")
			},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: "url-loader?limit=20000&mimetype=application/font-woff&name=/[hash].[ext]"
			},
			{
				test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: "file-loader"
			}
		]
	},
	plugins: [
		extractLESS
	]
};