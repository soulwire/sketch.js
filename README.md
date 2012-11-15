[sketch.js](https://github.com/soulwire/sketch.js) is a tiny (~5k) boilerplate for creating JavaScript based creative coding experiments.

Check out the [showcase](http://soulwire.github.com/sketch.js/).

### Why use sketch.js?

Sketch.js handles all that tedious but necessary stuff that would normally slow you down - setting up an animation loop, creating and managing a graphics context for Canvas or WebGL, cross browser and device event binding and normalisation for mouse, touch and keyboard events, handling window resizes… You get the idea.

When creating a sketch, you specify a _type_ (the default is `Sketch.CANVAS`) and what you get back is an augmented instance of a `CanvasRenderingContext2D`, `WebGLRenderingContext` or `Node` / `HTMLElement`. This gives you direct access to all the usual properties and methods of your chosen context, as well as some new and useful ones added by __sketch.js__

It also provides fast global access to useful math functions and constants and extends `random` to handle ranges and arrays.

For more information, check out the [getting started guide](https://github.com/soulwire/sketch.js/wiki/Getting-Started), the [API](https://github.com/soulwire/sketch.js/wiki/API) or the full [source](https://github.com/soulwire/sketch.js/blob/master/js/sketch.js), as well as the examples in the [showcase](http://soulwire.github.com/sketch.js/).

Have fun!