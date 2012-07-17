[sketch.js](https://github.com/soulwire/sketch.js) is a tiny (~5k) boilerplate for creating JavaScript based creative coding experiments. The [demo](http://soulwire.github.com/sketch.js/) shows what can be done with just a few lines of code.

It handles all that tedious but necessary stuff that would normally slow you down - setting up an animation loop, creating and managing a graphics context for Canvas or WebGL, cross browser and device event binding and normalisation for mouse, touch and keyboard events, handling window resizes… You get the idea.

When creating a sketch, you specify a _type_ (the default is `Sketch.CANVAS`) and what you get back is an augmented instance of a `CanvasRenderingContext2D`, `WebGLRenderingContext` or `Node` / `HTMLElement`. This gives you direct access to all the usual properties and methods of your chosen context, as well as some new and useful ones added by __sketch.js__

It also provides fast global access to useful math functions and constants and extends `random` to handle ranges and arrays. Check out the [wiki](https://github.com/soulwire/sketch.js/wiki/API) or the [source](https://github.com/soulwire/sketch.js/blob/master/js/sketch.js) for the full API.

###A Basic Example

If you’ve used libraries like [Processing](http://processing.org/) and [Open Frameworks](http://www.openframeworks.cc/) before, __sketch.js__ will be especially quick to get going with. You can simply hook onto methods like `setup`, `draw` and `mousemove` to start playing:

	var ctx = Sketch.create();

	ctx.draw = function() {
		ctx.beginPath();
		ctx.arc( random( ctx.width ), random( ctx.height ), 10, 0, TWO_PI );
		ctx.fill();
	}

Or if you prefer the syntax, you can also pass all the methods you want to use directly to the `create` method:

	Sketch.create({

		draw: function() {
			ctx.beginPath();
			ctx.arc( random( ctx.width ), random( ctx.height ), 10, 0, TWO_PI );
			ctx.fill();
		}

	});

###Events

Mouse, touch and keyboard events are augmented for convenience and certain properties are also stored in the sketch for when you need them outside event handlers.

The x and y properties are the mouse / touch coordinates relative to the window (clientX / clientY).

	ctx.mousemove = function( e ) {
		ctx.lineTo( e.x, e.y );
	}

If you're supporting touches, just handle them - on the desktop, the 0th element will be the mouse so your code will work the same accross devices and platforms.

	ctx.mousemove = function( e ) {
		for ( var i = 0, n = e.touches.length; i < n; i++ ) {
			ctx.arc( e.touches[i].x, e.touches[i].y, 10, 0, TWO_PI );
		}
	}

Touches and mouse position are also stored in the sketch for access outside event handlers.

	ctx.draw = function() {
		for ( var i = 0, n = ctx.touches.length; i < n; i++ ) {
			ctx.arc( ctx.touches[i].x, ctx.touches[i].y, 10, 0, TWO_PI );
		}
	}

Previous x and y values `ox`, `oy` and the deltas `dx`, `dy` are also sent in events and stored in the sketch

	ctx.mousemove = function( e ) {
		ctx.moveTo( e.ox, e.oy ); // or ctx.mouse.ox, ctx.mouse.oy
		ctx.lineTo( e.x, e.y ); // or ctx.mouse.x, ctx.mouse.y
	}

All keys are ennumerted and common function keys are mapped to constants.

	ctx.keydown = function() {
		if ( ctx.keys.SPACE ) ctx.reset();
		if ( ctx.keys.C ) ctx.clear();
	}

###Build

If you modify the source and want to produce your own build, install [UglifyJS](https://github.com/mishoo/UglifyJS) with CLI then run the following command from the sketch.js directory.

	uglifyjs -o js/sketch.min.js js/sketch.js