
var Demo;

Demo = (function() {

    /**
     * --------------------------------------------------
     *
     * Polyfills
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
     * Demo
     *
     * --------------------------------------------------
     */

    function Demo( options ) {

        // Merge options with defaults.
        this.options = this._extend( options, this._defaults );

        // Bind all methods to this scope.
        this._bindAll();
        this._bindAll( this.options, this );

        // Initialise properties.
        this.currentTime = +new Date();
        this.previousTime = this.currentTime;

        this.mouseX = 0.0;
        this.mouseY = 0.0;
        this.oMouseX = 0.0;
        this.oMouseY = 0.0;

        // Create container.
        this.domElement = document.createElement( 'div' );
        this.domElement.style.width = '100%';
        this.domElement.style.height = '100%';
        this.options.container.appendChild( this.domElement );

        // Create rendering context.
        switch( this.options.type ) {

            case Demo.CANVAS:

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
        addEvent( window, 'resize', this._onResize );

        // Initialise.
        this._onResize();
        this.options.setup();
        this._update( this.currentTime );
    }

    Demo.CANVAS = 'canvas';

    Demo.prototype._defaults = {

        type        : Demo.CANVAS,
        fullscreen  : true,
        container   : document.body,

        setup       : function() {},
        draw        : function( ctx, dt ) {},
        resize      : function( width, height ) {},
        mousemove   : function( event ) {},
        mousedown   : function( event ) {}
    };

    Demo.prototype._extend = function( child, parent ) {

        for ( var prop in parent ) {
            if ( !child.hasOwnProperty( prop ) && parent.hasOwnProperty( prop ) ) {
                child[ prop ] = parent[ prop ];
            }
        }

        return child;
    },

    Demo.prototype._bindAll = function( target, scope ) {

        target = target || this;
        scope = scope || this;

        for ( var prop in target ) {
            if ( typeof target[ prop ] === 'function' ) {
                target[ prop ] = target[ prop ].bind( scope );
            }
        }
    },

    Demo.prototype._update = function( time ) {

        this.previousTime = this.currentTime;
        this.currentTime = time;

        this.options.draw( this.ctx, this.currentTime - this.previousTime );

        requestAnimationFrame( this._update );
    };

    Demo.prototype._onResize = function( event ) {

        if ( this.options.fullscreen ) {

            this.width = window.innerWidth;
            this.height = window.innerHeight;

        } else {

            this.width = this.options.width;
            this.height = this.options.height;
        }

        switch ( this.options.type ) {

            case Demo.CANVAS:

                this.canvas.width = this.width;
                this.canvas.height = this.height;

                break;
        }

        this.options.resize( this.width, this.height );
    },

    Demo.prototype._onClick = function( event ) {

        this.options.mousedown( event );
    };

    Demo.prototype._onMouseMove = function( event ) {

        this.oMouseX = this.mouseX;
        this.oMouseY = this.mouseY;

        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        this.options.mousemove( event );
    };

    return Demo;

})();