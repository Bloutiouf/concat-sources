var assert = require("assert");
var concat = require("../index");

describe("API .sources", function() {
	var sources = [
		"foo\n",
		"bar\n"
	];
	
	it("should concatenate regular sources", function() {
		var concatenated = concat.sources(sources);
		assert(concatenated[0], sources.join(""));
	});
	
	it("should prepend header", function() {
		var concatenated = concat.sources(sources, {
			header: "header"
		});
		assert(concatenated[0], "header\n" + sources.join(""));
	});
});
