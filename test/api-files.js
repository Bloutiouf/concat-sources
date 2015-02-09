var assert = require("assert");
var concat = require("../index");

describe("API .files", function() {
	it("should concatenate files", function(done) {
		return concat.files([
			__dirname + "/fixtures/a.js",
			__dirname + "/fixtures/b.js.map",
			__dirname + "/fixtures/c.js.map",
			__dirname + "/fixtures/d.js.map",
			[__dirname + "/fixtures/e.js"],
			[__dirname + "/fixtures/f.js", __dirname + "/fixtures/f.js.map"]
		], function(err, concatenated) {
			if (err) return done(err);
			try {
				assert.equal(concatenated[0], 'console.log("a");\nconsole.log("b");\nconsole.log("c");\nconsole.log("d");\nconsole.log("e");\nconsole.log("f");\n');
				assert.equal(concatenated[1], '{"version":3,"sources":["a.js","b.js","c.js","../fixtures/d.js","f.js"],"names":["console","log"],"mappings":"AAAAA,OAAAC,IAAA,CAAY,GAAZ;ACAAD,OAAAC,IAAA,CAAY,GAAZ;ACAAD,OAAAC,IAAA,CAAY,GAAZ;ACAAD,OAAAC,IAAA,CAAY,GAAZ;;ACAAD,OAAAC,IAAA,CAAY,GAAZ"}');
			} catch(err) {
				return done(err);
			}
			return done();
		});
	});
});
