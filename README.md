
## sketch.js

[sketch.js](https://github.com/soulwire/sketch.js) is a tiny boilerplate for JavaScript creative coding experiments.

It handles the boring but necessary stuff, like setting up an animation loop, binding mouse, touch and keyboard events, creating a drawing context and handling resizing - allowing you to only write the code that you need to make cool things.

Check out [the demo](http://soulwire.github.com/sketch.js/) to see what can be made with a few lines of code.

### A Basic Example

To get going, just create a new Sketch instance and pass in the properties and methods you want to use:

	new Sketch({

		COLOURS: [ '#69D2E7', '#E0E4CC', '#FA6900', '#F9D423' ],

		setup: function() {
			this.circles = [];
		},

		draw: function( ctx ) {
			for ( var i = 0, n = this.circles.length, c; i < n; i++ ) {
				c = this.circles[i];
				ctx.beginPath();
				ctx.globalAlpha = c.a;
				ctx.arc( c.x, c.y, c.r, 0, TWO_PI );
				ctx.fillStyle = c.c;
				ctx.fill();
			};
		},

		mousemove: function() {
			this.circles.push({
				x: this.mouseX,
				y: this.mouseY,
				c: random( this.COLOURS ),
				a: random( 0.5, 0.8 ),
				r: random( 10, 40 )
			});
		}
	});

__sketch.js__ roughly follows the structure of libraries like [Processing](http://processing.org/) and [Open Frameworks](http://www.openframeworks.cc/), providing methods like __setup__, __draw__, __mousemove__ and __keydown__, as well as useful things like the current and previous mouse position, delta time between frames and shortcuts to common math functions and constants.

_Full API coming soon_

#### Building

If you modify the source and want to produce your own build, install [UglifyJS](https://github.com/mishoo/UglifyJS) with CLI then run the following command from the _sketch.js_ directory.

	uglifyjs -v -o js/sketch.min.js js/sketch.js