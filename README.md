## sketch.js

A tiny (~2kb gzipped) platform for JavaScript creative coding.

<p align="center">
<a target="_blank" href="http://soulwire.github.io/sketch.js/examples/drawing.html"><img width="24.5%" src="http://soulwire.github.io/sketch.js/examples/img/drawing.jpg"></a>
<a target="_blank" href="http://soulwire.github.io/sketch.js/examples/particles.html"><img width="24.5%" src="http://soulwire.github.io/sketch.js/examples/img/particles.jpg"></a>
<a target="_blank" href="http://soulwire.github.com/Plasmatic-Isosurface/"><img width="24.5%" src="http://soulwire.github.io/sketch.js/examples/img/plasma.jpg"></a>
<a target="_blank" href="http://soulwire.github.com/Muscular-Hydrostats/"><img width="24.5%" src="http://soulwire.github.io/sketch.js/examples/img/tentacles.jpg"></a>
</p>

A few examples from the [showcase](http://soulwire.github.com/sketch.js/)

### Start Coding Faster

sketch.js lets you get straight to the fun parts of creative coding, without ever having to worry about shims or boilerplate code.

It gives you a graphics context, an animation loop, normalised input events and a host of useful callbacks to hook into.

Here's an example:
````js
Sketch.create({
  setup() {
    this.r = this.g = this.b = random(100, 200)
  },
  mousemove() {
    this.r = 255 * (this.mouse.x / this.width)
    this.g = 255 * (this.mouse.y / this.height)
    this.b = 255 * abs(cos(PI * this.mouse.y / this.width))
  },
  draw() {
    this.fillStyle = `rgb(${~~this.r},${~~this.g},${~~this.b})`
    this.fillRect(0, 0, this.width, this.height)
  }
})
````

[See it in action](http://jsfiddle.net/soulwire/7wtbm/)

### The Highlights

 * A sketch is an augmented drawing context (`CanvasRenderingContext2D`, `WebGLRenderingContext` or `HTMLElement`) so it has all the expected drawing methods built in.
 * The `mouse` property is also the first element of the `touches` array and vice versa, so you can code to one standard and get touch and multi-touch support for free.
 * The `update` and `draw` loops run on the browser animation frame and can `stop` and `start` whenever you like.
 * You get fast access to `Math` functions and constants, plus extras like range and array enabled `random`, `map` and `lerp`.
 * Simple and configurable. You can even bring your own `context`, so it works well with libraries like [THREE](http://threejs.org/).

### The Rest

For more information, check out the [getting started guide](https://github.com/soulwire/sketch.js/wiki/Getting-Started), the [API](https://github.com/soulwire/sketch.js/wiki/API), the many examples in the [showcase](http://soulwire.github.com/sketch.js/) and the full [source](https://github.com/soulwire/sketch.js/blob/master/js/sketch.js).

### Support TypeScript

According to the [API Document](https://github.com/soulwire/sketch.js/wiki/API) create the basic DTS File :`sketch.d.ts` . 
So it maybe has some flaws in part... 
Anyway , it always work better than no DTS.

How to use it :

you can import it through use <reference path="..."> tag like this:
  ```
    /// <reference path="./sketch.d.ts">
  ```
