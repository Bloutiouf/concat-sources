var async = require("async");
var fs = require("fs");
var path = require("path");
var sourceMap = require("source-map");

function countLines(s) {
	var lines = 0;
	var index = 0;
	while ((index = s.indexOf("\n", index)) !== -1) {
		++lines;
		++index;
	}
	return lines;
}

exports.files = function(files, options, callback) {
	if (!callback) {
		callback = options;
		options = {};
	}
	
	if (!options.encoding)
		options.encoding = "utf8";
	
	return async.map(files, function(file, callback) {
		if (Array.isArray(file))
			return async.map(file, function(file, callback) {
				return fs.readFile(file, options, callback);
			}, callback);
		
		var ext = path.extname(file);
		if (ext.toLowerCase() === ".map")
			return fs.readFile(file, options, function(err, map) {
				if (err) return callback(err);
				try {
					map = JSON.parse(map);
				} catch (err) {
					return callback(err);
				}
				var source = path.resolve(path.dirname(file), map.sourceRoot || ".", map.file ? map.file : path.basename(file, ext));
				return fs.readFile(source, options, function(err, source) {
					if (err) return callback(err);
					return callback(null, [source, map]);
				});
			});
		
		return fs.readFile(file, options, function(err, source) {
			if (err) return callback(err);
			return fs.readFile(file + ".map", options, function(err, map) {
				if (err) {
					if (err.code === "ENOENT")
						return callback(null, source);
					else
						return callback(err);
				}
				return callback(null, [source, map]);
			});
		});
	}, function(err, contents) {
		if (err) return callback(err);
		var concatenated;
		try {
			concatenated = exports.sources(contents, options);
		} catch (err) {
			return callback(err);
		}
		return callback(null, concatenated);
	});
};

exports.sources = function(contents, options) {
	var generator = new sourceMap.SourceMapGenerator(options);
	
	var lineOffset = 0;
	var header = "";
	
	if (options && options.header) {
		header = options.header + "\n";
		lineOffset = countLines(header);
	}
	
	var file = header + contents.map(function(content, index) {
		if (Array.isArray(content) && content[1]) {
			var map = new sourceMap.SourceMapConsumer(content[1]);
			map.eachMapping(function(mapping) {
				if (!mapping.originalLine) return;
				var source = content[2] || (options && options.sourceMap ? options.sourceMap(mapping.source, index) : mapping.source);
				return generator.addMapping({
					generated: {
						line: mapping.generatedLine + lineOffset,
						column: mapping.generatedColumn
					},
					name: mapping.name,
					original: {
						line: mapping.originalLine,
						column: mapping.originalColumn
					},
					source: source
				});
			});
		}
		
		var file = Array.isArray(content) ? content[0] : content;
		lineOffset += countLines(file);
		return file;
	}).join("");
	
	return [file, generator.toString()];
};
