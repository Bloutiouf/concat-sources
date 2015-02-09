# concat-sources

Concatenate source files together, taking into account **source map** files.

This is useful for minifying files whose compilers also generate associated source maps, while keeping a valid source map. For instance:

* for **JS**: CoffeeScript, Dart, etc.
* for **CSS**: SASS, LESS, Stylus, etc.

Note that the generated source **does not contain** `/*# sourceMappingURL=<url> */`, you have to add it yourself.

It can also simply concatenate files of any type, in this case the generated source map makes no sense.

The files are expected to end with `\n`. No extra `\n` is added.

## API

> npm install --save concat-sources

	var concat = require("concat-sources");
	
	var concatenated = concat.sources(sourceArray [, options]);
	// concatenated[0] is the generated source file
	// concatenated[1] is the generated source map file
	
	concat.files(fileArray [, options], function(err, concatenated) {
		if (err) throw err;
		...
	});

### .sources(sourceArray [, options])

Takes a list of source **strings** and concatenates them with a resulting source map.

The call is _synchronous_.

Each item of `sourceArray` can be:

* a `string` containing the contents to be concatenated.
* an `array`, where
	* the first item (index 0) is a `string` containing the contents
	* if defined, the second item (index 1) is the associated source map as a `string` or `object`
	* if defined, the third item (index 2) is a `string` which overwrites the mapping source filename. In this case, `options.soureMap` is not called. 

`options` can contain:

* `header`: `string` appended at the top of the generated source file
* `sourceMap`: `function(source:string, index:int):string` is called for every mapping with its source filename and file index as argument, and must return a filename

### .files(fileArray [, options], callback)

Takes a list of source **paths** and concatenates them with a resulting source map.

It is a simple wrapper over `.sources`. The call is *asynchronous* as it reads files. Note that the call only returns strings, it does not write any file. Use `fs.writeFile` if you want so. 

Each item of `fileArray` can be:

* a `string` containing the name of the file to be concatenated. It also tries to load the same filename + `.map`, and if it succeeds, this becomes the associated source map.
	* If the filename already ends with `.map`, then it is taken as a source map. The source file is either mentioned in the source map, or this is this filename without `.map`. It throws an error if the file cannot be read. In order to avoid this behavior, specify the filename within an array.
* an `array`, where
	* the first item (index 0) is the filename
	* if defined, the second item (index 1) is the filename of the associated source map.

Example:

	concat.files([
		"a.js", // tries to read the souce map "a.js.map" as well
		"b.js.map", // tries to read the source mentioned in this source map, or "b.js" if undefined
		["c.js"], // reads only this file as a source, no source map here
		["d.js", "d.js.map"] // reads the source and the source map
	], ... 

`options` are passed to `.sources` and can also contain:

* `encoding`: `string` files encoding, default `utf8`

## CLI

> npm install -g concat-sources

	> concat-sources a.js b.js.map ... -o concatenated.js -m concatenated.js.map

The following rules apply for the filenames: (similar to `.files` above)

1. if the filename ends with `.map`, this is taken as a source map. The source file is either mentioned in the source map, or this is this filename without `.map`. It throws an error if the file cannot be read.
2. otherwise, this is taken as a source. It also tries to load the same filename + `.map`, and if it succeeds, this becomes the associated source map.

Available options:

* `-e`, `--encoding`: Encoding, default is `utf8`
* `-h`, `--header`: Header
* `-m`, `--map`: Generated source map name
* `-o`, `--output`: Generated source name `required`

## License

Copyright (c) 2015 Jonathan Giroux

[MIT License](http://opensource.org/licenses/MIT)
