
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
     * requestAnimationFrame polyfill by Erik Möller
     * Fixes from Paul Irish and Tino Zijdel
     *
     * @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     * @see http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
     */

    (function(){for(var d=0,a=["ms","moz","webkit","o"],b=0;b<a.length&&!window.requestAnimationFrame;++b)window.requestAnimationFrame=window[a[b]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[a[b]+"CancelAnimationFrame"]||window[a[b]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b){var a=(new Date).getTime(),c=Math.max(0,16-(a-d)),e=window.setTimeout(function(){b(a+c)},c);d=a+c;return e});window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})})();

    /**
     * Function.prototype.bind polyfill
     *
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
     */

    Function.prototype.bind||(Function.prototype.bind=function(c){if("function"!==typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var a=[].slice,d=a.call(arguments,1),e=this,f=function(){},b=function(){return e.apply(this instanceof f?this:c||{},d.concat(a.call(arguments)))};b.prototype=this.prototype;return b});

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

        // Generate a GUID for thi sketch.
        this.id = 'sketch-' + floor( random( 0xffffff ) );

        // Merge options with defaults.
        options = this._extend( options || {}, this._defaults );
        this._extend( this, options );

        if ( this.autostart ) {
            this.start();
        }
    }

    Sketch.CANVAS = 'canvas';

    Sketch.prototype = {

        /**
         * --------------------------------------------------
         *
         *  Config
         *
         * --------------------------------------------------
         */

        _globals: {

            PI         : Math.PI,
            TWO_PI     : Math.PI * 2,
            HALF_PI    : Math.PI / 2,
            QUATER_PI  : Math.PI / 4,

            sin        : Math.sin,
            cos        : Math.cos,
            tan        : Math.tan,
            pow        : Math.pow,
            exp        : Math.exp,
            min        : Math.min,
            max        : Math.max,
            sqrt       : Math.sqrt,
            atan       : Math.atan,
            atan2      : Math.atan2,
            ceil       : Math.ceil,
            round      : Math.round,
            floor      : Math.floor,

            random     : function( min, max ) {

                // Allow for random string / array access.
                if ( min && typeof min.length === 'number' && !!min.length ) {
                    return min[ Math.floor( Math.random() * min.length ) ];
                }

                if ( typeof max !== 'number' ) {
                    max = min || 1.0, min = 0;
                }

                return min + Math.random() * (max - min);
            }
        },

        _defaults: {

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
        },

        /**
         * --------------------------------------------------
         *
         *  Public API
         *
         * --------------------------------------------------
         */

        start: function() {

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
            this.domElement.id = this.id;
            this.domElement.className = 'sketch';
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
            this._addEvent( this.domElement, 'click', this._onClick );
            this._addEvent( this.domElement, 'mousemove', this._onMouseMove );
            this._addEvent( this.domElement, 'touchstart', this._onTouchStart );
            this._addEvent( this.domElement, 'touchmove', this._onTouchMove );
            this._addEvent( window, 'keydown', this._onKeyDown );
            this._addEvent( window, 'keyup', this._onKeyUp );
            this._addEvent( window, 'resize', this._onResize );

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

        clear: function() {

            switch ( this.type ) {

                case Sketch.CANVAS:

                    this.canvas.width = this.canvas.width;

                    break;
            }
        },

        destroy: function() {

            // Unbind event handlers.
            this._removeEvent( this.domElement, 'click', this._onClick );
            this._removeEvent( this.domElement, 'mousemove', this._onMouseMove );
            this._removeEvent( this.domElement, 'touchstart', this._onTouchStart );
            this._removeEvent( this.domElement, 'touchmove', this._onTouchMove );
            this._removeEvent( window, 'keydown', this._onKeyDown );
            this._removeEvent( window, 'keyup', this._onKeyUp );
            this._removeEvent( window, 'resize', this._onResize );
        },

        /**
         * --------------------------------------------------
         *
         *  Methods
         *
         * --------------------------------------------------
         */

        _extend: function( child, parent ) {

            for ( var prop in parent ) {
                if ( !child.hasOwnProperty( prop ) && parent.hasOwnProperty( prop ) ) {
                    child[ prop ] = parent[ prop ];
                }
            }

            return child;
        },

        _bindAll: function( target, scope ) {

            target = target || this;
            scope = scope || this;

            for ( var prop in target ) {
                if ( typeof target[ prop ] === 'function' ) {
                    target[ prop ] = target[ prop ].bind( scope );
                }
            }
        },

        _addEvent: function( el, ev, fn ) {

            if ( window.addEventListener ) {

                el.addEventListener( ev, fn, false );

            } else if ( window.attachEvent ) {

                el.attachEvent( 'on' + ev, fn );

            } else {

                el[ 'on' + ev ] =  fn;
            }
        },

        _removeEvent: function() {

            if ( window.removeEventListener ) {

                el.removeEventListener( ev, fn, false );

            } else if ( window.detachEvent ) {

                el.detachEvent( 'on' + ev, fn );

            } else {

                el[ 'on' + ev ] =  null;
            }
        },

        _initStats: function() {

            if ( typeof Stats === 'function' ) {

                this._stats = new Stats();
                this._stats.setMode(0);

                this._stats.domElement.style.position = 'absolute';
                this._stats.domElement.style.right = '10px';
                this._stats.domElement.style.top = '10px';

                document.body.appendChild( this._stats.domElement );
            }
        },

        _setMouse: function( x, y ) {

            this.oMouseX = this.mouseX;
            this.oMouseY = this.mouseY;

            this.mouseX = x;
            this.mouseY = y;
        },

        _update: function( time ) {

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
        },

        /**
         * --------------------------------------------------
         *
         *  Event Handlers
         *
         * --------------------------------------------------
         */

        _onResize: function( event ) {

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

        _onTouchStart: function( event ) {
        },

        _onClick: function( event ) {

            this.click( event );
        },

        _onMouseMove: function( event ) {

            this._setMouse( event.clientX, event.clientY );
            this.mousemove( event );
        },

        _onTouchMove: function( event ) {

            event.preventDefault();

            this.touches = event.touches;
            var touch = this.touches[0];

            this._setMouse( touch.pageX, touch.pageY );
            this.touchmove( event );
            this.mousemove( event );
        },

        _onKeyDown: function( event ) {

            this.key = event.keyCode;
            this.ALT = event.altKey;
            this.CTRL = event.ctrlKey || event.metaKey;
            this.SHIFT = event.shiftKey;

            this.keydown( event );
        },

        _onKeyUp: function( event ) {

            this.key = null;
            this.ALT = this.CTRL = this.SHIFT = false;

            this.keyup( event );
        }
    };

    return Sketch;

})();