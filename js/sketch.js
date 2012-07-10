
/**
 * --------------------------------------------------
 *
 *  A simple base for JavaScript creative coding
 *  experiments or sketches...
 *
 * --------------------------------------------------
 */

var Sketch;

Sketch = (function() {

    /**
     * --------------------------------------------------
     *
     *  Polyfills
     *
     * --------------------------------------------------
     */

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    // requestAnimationFrame polyfill by Erik Möller
    // fixes from Paul Irish and Tino Zijdel

    (function() {

        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    // Function.prototype.bind polyfill
    // @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind

    if (!Function.prototype.bind) {
        Function.prototype.bind = function (obj) {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            if (typeof this !== 'function') {
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var slice = [].slice,
                args = slice.call(arguments, 1),
                self = this,
                nop = function () { },
                bound = function () {
                    return self.apply(this instanceof nop ? this : (obj || {}),
                                      args.concat(slice.call(arguments)));
                };

            bound.prototype = this.prototype;

            return bound;
        };
    }

    // add / remove event listener

    var addEvent = (function () {

        if (window.addEventListener) {

            return function (el, ev, fn) {
                el.addEventListener(ev, fn, false);
            };

        } else if (window.attachEvent) {

            return function (el, ev, fn) {
                el.attachEvent('on' + ev, fn);
            };

        } else {

            return function (el, ev, fn) {
                el['on' + ev] =  fn;
            };
        }
    }());

    var removeEvent = (function () {

        if (window.removeEventListener) {

            return function (el, ev, fn) {
                el.removeEventListener(ev, fn, false);
            };

        } else if (window.detachEvent) {

            return function (el, ev, fn) {
                el.detachEvent('on' + ev, fn);
            };

        } else {

            return function (el, ev, fn) {
                el['on' + ev] =  null;
            };
        }
    }());

    /**
     * --------------------------------------------------
     *
     *  Sketch
     *
     * --------------------------------------------------
     */

    function Sketch( options ) {

        // Provide some useful global properties & methods.
        this._extend( window, this._globals );

        // Merge options with defaults.
        options = this._extend( options || {}, this._defaults );
        this._extend( this, options );

        if ( this.autostart ) {
            this.start();
        }
    }

    Sketch.CANVAS = 'canvas';

    Sketch.prototype._globals = {

        PI: Math.PI,
        TWO_PI: Math.PI * 2,
        HALF_PI: Math.PI / 2,
        QUATER_PI: Math.PI / 4,

        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        pow: Math.pow,
        exp: Math.exp,
        min: Math.min,
        max: Math.max,
        sqrt: Math.sqrt,
        atan: Math.atan,
        atan2: Math.atan2,
        ceil: Math.ceil,
        round: Math.round,
        floor: Math.floor,

        random: function( min, max ) {

            // Allow for random string / array access.
            if ( min && typeof min.length === 'number' && !!min.length ) {
                return min[ Math.floor( Math.random() * min.length ) ];
            }

            if ( typeof max !== 'number' ) {
                max = min || 1.0;
                min = 0;
            }

            return min + Math.random() * (max - min);
        }
    };

    Sketch.prototype._defaults = {

        type        : Sketch.CANVAS,
        fullscreen  : true,
        autoclear   : true,
        autostart   : true,
        container   : document.body,

        setup       : function() {},
        draw        : function( ctx, dt ) {},
        resize      : function( width, height ) {},
        touchstart  : function( event ) {},
        touchmove   : function( event ) {},
        mousemove   : function( event ) {},
        click       : function( event ) {},
        keydown     : function( event ) {},
        keyup       : function( event ) {}
    };

    Sketch.prototype._extend = function( child, parent ) {

        for ( var prop in parent ) {
            if ( !child.hasOwnProperty( prop ) && parent.hasOwnProperty( prop ) ) {
                child[ prop ] = parent[ prop ];
            }
        }

        return child;
    },

    Sketch.prototype._bindAll = function( target, scope ) {

        target = target || this;
        scope = scope || this;

        for ( var prop in target ) {
            if ( typeof target[ prop ] === 'function' ) {
                target[ prop ] = target[ prop ].bind( scope );
            }
        }
    },

    Sketch.prototype._update = function( time ) {

        if ( this._stats ) {
            this._stats.begin();
        }

        this.previousTime = this.currentTime;
        this.currentTime = time;

        if ( this.autoclear ) {
            this.clear();
        }

        this.draw( this.ctx, this.currentTime - this.previousTime );

        requestAnimationFrame( this._update );

        if ( this._stats ) {
            this._stats.end();
        }
    };

    Sketch.prototype._initStats = function() {

        if ( typeof Stats === 'function' ) {

            this._stats = new Stats();
            this._stats.setMode(0);

            this._stats.domElement.style.position = 'absolute';
            this._stats.domElement.style.right = '10px';
            this._stats.domElement.style.top = '10px';

            document.body.appendChild( this._stats.domElement );
        }
    };

    Sketch.prototype._setMouse = function( x, y ) {

        this.oMouseX = this.mouseX;
        this.oMouseY = this.mouseY;

        this.mouseX = x;
        this.mouseY = y;
    };

    /**
     * --------------------------------------------------
     *
     *  Event Handlers
     *
     * --------------------------------------------------
     */

    Sketch.prototype._onResize = function( event ) {

        if ( this.fullscreen ) {

            this.width = window.innerWidth;
            this.height = window.innerHeight;

        } else {

            this.width = this.width;
            this.height = this.height;
        }

        switch ( this.type ) {

            case Sketch.CANVAS:

                this.canvas.width = this.width;
                this.canvas.height = this.height;

                break;
        }

        this.domElement.style.width = this.width;
        this.domElement.style.height = this.height;

        this.resize( this.width, this.height );
    },

    Sketch.prototype._onTouchStart = function( event ) {
    };

    Sketch.prototype._onClick = function( event ) {

        this.click( event );
    };

    Sketch.prototype._onMouseMove = function( event ) {

        this._setMouse( event.clientX, event.clientY );
        this.mousemove( event );
    };

    Sketch.prototype._onTouchMove = function( event ) {

        event.preventDefault();

        this.touches = event.touches;
        var touch = this.touches[0];

        this._setMouse( touch.pageX, touch.pageY );
        this.touchmove( event );
        this.mousemove( event );
    };

    Sketch.prototype._onKeyDown = function( event ) {

        this.key = event.keyCode;
        this.ALT = event.altKey;
        this.CTRL = event.ctrlKey || event.metaKey;
        this.SHIFT = event.shiftKey;

        this.keydown( event );
    },

    Sketch.prototype._onKeyUp = function( event ) {

        this.key = null;
        this.ALT = this.CTRL = this.SHIFT = false;

        this.keyup( event );
    },

    /**
     * --------------------------------------------------
     *
     *  Public API
     *
     * --------------------------------------------------
     */

    Sketch.prototype.start = function() {

        // Bind all methods to this scope.
        this._bindAll();

        // Initialise properties.
        this.currentTime = +new Date();
        this.previousTime = this.currentTime;

        this.mouseX = 0.0;
        this.mouseY = 0.0;
        this.oMouseX = 0.0;
        this.oMouseY = 0.0;
        this.touches = [];

        this.ALT = false;
        this.CTRL = false;
        this.SHIFT = false;

        // Create container.
        this.domElement = document.createElement( 'div' );
        this.container.appendChild( this.domElement );

        // Create rendering context.
        switch( this.type ) {

            case Sketch.CANVAS:

                if ( !!window.CanvasRenderingContext2D ) {

                    this.canvas = document.createElement( 'canvas' );
                    this.ctx = this.canvas.getContext( '2d' );
                    this.domElement.appendChild( this.canvas );

                } else {

                    throw new Error( 'CanvasRenderingContext2D not supported' );
                }

                break;
        }

        // Bind event handlers.
        addEvent( this.domElement, 'click', this._onClick );
        addEvent( this.domElement, 'mousemove', this._onMouseMove );
        addEvent( this.domElement, 'touchstart', this._onTouchStart );
        addEvent( this.domElement, 'touchmove', this._onTouchMove );
        addEvent( window, 'keydown', this._onKeyDown );
        addEvent( window, 'keyup', this._onKeyUp );
        addEvent( window, 'resize', this._onResize );

        // Add stats.
        if ( this.stats ) {

            if ( typeof Stats === 'function' ) {

                this._initStats();

            } else {

                var script = document.createElement( 'script' );
                script.setAttribute( 'type', 'text/javascript' );
                script.setAttribute( 'src', 'https://raw.github.com/mrdoob/stats.js/d5f5aa40a24a6d5667ecbcef20c13c75cf236bcd/build/Stats.js' );
                script.onload = this.onreadystatechange = this._initStats;

                document.body.appendChild( script );
            }
        }

        // Initialise.
        this._onResize();
        this.setup();
        this._update( this.currentTime );
    },

    Sketch.prototype.clear = function() {

        switch ( this.type ) {

            case Sketch.CANVAS:

                this.canvas.width = this.canvas.width;

                break;
        }
    };

    return Sketch;

})();