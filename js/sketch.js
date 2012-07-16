
/**
 * Copyright (C) 2012 by Justin Windle
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// requestAnimationFrame polyfill by Erik Möller
// Fixes from Paul Irish and Tino Zijdel
// @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// @see http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

(function(){for(var d=0,a=["ms","moz","webkit","o"],b=0;b<a.length&&!window.requestAnimationFrame;++b)window.requestAnimationFrame=window[a[b]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[a[b]+"CancelAnimationFrame"]||window[a[b]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b){var a=(new Date).getTime(),c=Math.max(0,16-(a-d)),e=window.setTimeout(function(){b(a+c)},c);d=a+c;return e});window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})})();

// Function.prototype.bind polyfill
// @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind

Function.prototype.bind||(Function.prototype.bind=function(c){if("function"!==typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var a=[].slice,d=a.call(arguments,1),e=this,f=function(){},b=function(){return e.apply(this instanceof f?this:c||{},d.concat(a.call(arguments)))};b.prototype=this.prototype;return b});

// ----------------------------------------
// sketch.js
// ----------------------------------------

var sketch = (function() {

    // ----------------------------------------
    // CONSTANTS
    // ----------------------------------------

    var GUID   = 0;
    var CANVAS = 'canvas';
    var WEB_GL = 'web-gl';

    // ----------------------------------------
    // Members
    // ----------------------------------------

    var ctx;
    var timeout = -1;

    // Default options
    var defaults = {

        fullscreen : true,
        autostart  : true,
        autoclear  : true,
        container  : document.body,
        type       : CANVAS

    };

    // Mixed into the window object
    var globals = {

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

            if ( min && typeof min.length === 'number' && !!min.length )
                return min[ Math.floor( Math.random() * min.length ) ];

            if ( typeof max !== 'number' )
                max = min || 1, min = 0;

            return min + Math.random() * (max - min);
        }
    };

    // Properties & methods mixed into ctx
    var api = {

        millis     : 0,   // Total running milliseconds
        now        : 0,   // Current time in milliseconds
        dt         : 0,   // Delta time between frames (milliseconds)

        keys       : {},  // Hash of currently pressed keys
        mouseX     : 0,
        mouseY     : 0,
        oMouseX    : 0,
        oMouseY    : 0,
        touches    : [],
        dragging   : false,

        // Starts the update / rendering process
        start: function() {

            if ( ctx.setup ) ctx.setup();
            update();
        },

        // Stops the update / rendering process
        stop: function() {

            cancelAnimationFrame( timeout );
        },

        // Clears the current drawing context
        // TODO: Empty children here for non-canvas sketches?
        clear: function() {

            if ( ctx.canvas )
                ctx.canvas.width = ctx.canvas.width;
        }
    };

    // ----------------------------------------
    // Helpers
    // ----------------------------------------

    var bind = (function() {

        if ( window.addEventListener )

            return function( el, ev, fn ) { el.addEventListener( ev, fn, false ); };

        else if ( window.attachEvent )

            return function( el, ev, fn ) { el.attachEvent( 'on' + ev, fn ); };

        else el[ 'on' + ev ] = fn;

    })();

    var unbind = (function() {

        if ( window.removeEventListener )

            return function( el, ev, fn ) { el.removeEventListener( ev, fn, false ); };

        else if ( window.detachEvent )

            return function( el, ev, fn ) { el.detachEvent( 'on' + ev, fn ); };

        else el[ 'on' + ev ] = null;

    })();

    // ----------------------------------------
    // Methods
    // ----------------------------------------

    // Sets up & returns a new sketch
    function create( options ) {

        options = extend( options || {}, defaults );

        var id = 'sketch-' + GUID++;
        var canvas = document.createElement( 'canvas' );

        switch ( options.type ) {

            case sketch.WEB_GL:

                try { ctx = canvas.getContext( 'webgl', options ); } catch (e) {}
                try { ctx = ctx || canvas.getContext( 'experimental-webgl', options ); } catch (e) {}
                if ( !ctx ) throw 'WebGL not supported';

                break;

            case sketch.CANVAS:

                try { ctx = canvas.getContext( '2d', options ); } catch (e) {}
                if ( !ctx ) throw 'Canvas not supported';

                break;

            default:

                canvas = ctx = document.createElement( 'div' );
        }

        // ID & class can be useful
        canvas.className = 'sketch';
        canvas.id = id;

        options.container.appendChild( canvas );

        // Mix globals into the window object
        extend( self, globals );

        // Mix options into ctx
        extend( ctx, options );

        // Add public properties
        extend( ctx, api );

        // Bind event handlers
        bindEvents();

        // Set initial dimensions
        resize();

        if ( ctx.autostart ) setTimeout( ctx.start, 0 );

        return ctx;
    }

    // Soft object merge
    function extend( target, source ) {

        for ( var prop in source ) {

            if ( !target.hasOwnProperty( prop ) ) {
                target[ prop ] = source[ prop ];
            }
        }

        return target;
    }

    // Shallow clones a given object
    function clone( obj ) {

        var copy = {};

        function getCallback( method, context ) {

            return function() {
                method.call( context, arguments );
            };
        }

        for ( var prop in obj ) {

            if ( typeof obj[ prop ] === 'function' )

                copy[ prop ] = getCallback( obj[ prop ], obj );

            else

                copy[ prop ] = obj[ prop ];
        }

        return copy;
    }

    // Sets up sketch mouse & keyboard events
    function bindEvents() {

        var keynames = {
            8:  'BACKSPACE',
            9:  'TAB',
            13: 'ENTER',
            16: 'SHIFT',
            27: 'ESCAPE',
            32: 'SPACE',
            37: 'LEFT',
            38: 'UP',
            39: 'RIGHT',
            40: 'DOWN'
        };

        // Explicitly set all keys to false initially
        for ( var name in keynames ) {
            api.keys[ keynames[ name ] ] = false;
        }

        // maps a key code to a key name
        function map( code ) {
            return keynames[ code ] || String.fromCharCode( code );
        }

        // Update mouse position
        function updateMouse( coord ) {

            ctx.oMouseX = ctx.mouseX;
            ctx.oMouseY = ctx.mouseY;

            ctx.mouseX = coord.x;
            ctx.mouseY = coord.y;
        }

        var old = {};

        // Augments the native mouse event
        function augment( event ) {

            var o, e = clone( event );
            e.original = event;

            // Compute container offset
            for ( var el = ctx.canvas, ox = 0, oy = 0; el; el = el.offsetParent ) {

                ox += el.offsetLeft;
                oy += el.offsetTop;
            }

            // Normalise touches / mouse
            if ( e.touches && !!e.touches.length ) {

                for ( var i = e.touches.length - 1, touch; i >= 0; i-- ) {

                    touch = e.touches[i];
                    touch.x = touch.pageX - ox;
                    touch.y = touch.pageY - oy;

                    o = old[i] || touch;

                    touch.deltaX = touch.x - o.x;
                    touch.deltaY = touch.y - o.x;

                    touch.oldX = o.x;
                    touch.oldY = o.y;

                    old[i] = clone( touch );
                }

            } else {

                e.x = e.pageX - ox;
                e.y = e.pageY - oy;

                o = old[ 'mouse' ] || e;

                e.deltaX = e.x - o.x;
                e.deltaY = e.y - o.y;

                e.oldX = o.x;
                e.oldY = o.y;

                old[ 'mouse' ] = e;
            }

            return e;
        }

        // Touch events

        function touchstart( event ) {

            // Prevent scrolling (should this be optional?)
            event.preventDefault();

            event = augment( event );
            ctx.touches = event.touches;
            updateMouse( ctx.touches[0] );

            if ( ctx.touchstart ) ctx.touchstart( event );
        }

        function touchmove( event ) {

            event = augment( event );
            ctx.touches = event.touches;
            updateMouse( ctx.touches[0] );

            if ( ctx.touchmove ) ctx.touchmove( event );
            if ( ctx.mousemove ) ctx.mousemove( event );
        }

        function touchend( event ) {

            event = augment( event );

            // Cleanup ended touches
            if ( !event.touches.length ) old = {};
            else for ( var id in old ) if ( !event.touches[ id ] ) delete old[ id ];

            if ( ctx.touchend ) ctx.touchend( event );
        }

        // Mouse events

        function mouseover( event ) {

            event = augment( event );
            if ( ctx.mouseover ) ctx.mouseover( event );
        }

        function mousedown( event ) {

            event = augment( event );

            if ( !ctx.dragging ) {

                unbind( ctx.canvas, 'mousemove', mousemove );
                unbind( ctx.canvas, 'mouseup', mouseup );

                bind( document, 'mousemove', mousemove );
                bind( document, 'mouseup', mouseup );

                ctx.dragging = true;
            }

            ctx.touches = [ event ];

            if ( ctx.mousedown ) ctx.mousedown( event );
        }

        function mousemove( event ) {

            event = augment( event );
            updateMouse( event );

            ctx.touches = [ event ];

            if ( ctx.mousemove ) ctx.mousemove( event );
            if ( ctx.touchmove ) ctx.touchmove( event );
        }

        function mouseout( event ) {

            event = augment( event );
            if ( ctx.mouseout ) ctx.mouseout( event );
        }

        function mouseup( event ) {

            event = augment( event );

            if ( ctx.dragging ) {

                unbind( document, 'mousemove', mousemove );
                unbind( document, 'mouseup', mouseup );

                bind( ctx.canvas, 'mousemove', mousemove );
                bind( ctx.canvas, 'mouseup', mouseup );

                ctx.dragging = false;
            }

            delete old[ 'mouse' ];

            if ( ctx.mouseup ) ctx.mouseup( event );
        }

        function click( event ) {

            event = augment( event );
            if ( ctx.click ) ctx.click( event );
        }

        // Keyboard events

        function keydown( event ) {

            ctx.keys[ map( event.keyCode ) ] = true;
            ctx.keys[ event.keyCode ] = true;

            if ( ctx.keydown ) ctx.keydown( event );
        }

        function keyup( event ) {

            ctx.keys[ map( event.keyCode ) ] = false;
            ctx.keys[ event.keyCode ] = false;

            if ( ctx.keyup ) ctx.keyup( event );
        }

        // Bind to context

        bind( ctx.canvas, 'touchstart', touchstart );
        bind( ctx.canvas, 'touchmove', touchmove );
        bind( ctx.canvas, 'touchend', touchend );

        bind( ctx.canvas, 'mouseover', mouseover );
        bind( ctx.canvas, 'mousedown', mousedown );
        bind( ctx.canvas, 'mousemove', mousemove );
        bind( ctx.canvas, 'mouseout', mouseout );
        bind( ctx.canvas, 'mouseup', mouseup );
        bind( ctx.canvas, 'click', click );

        bind( document, 'keydown', keydown );
        bind( document, 'keyup', keyup );

        bind( window, 'resize', resize );
    }

    // ----------------------------------------
    // Event handlers
    // ----------------------------------------

    function update( now ) {

        ctx.dt = ( now = now || +new Date() ) - ctx.now;
        ctx.millis += ctx.dt;
        ctx.now = now;

        if ( ctx.update ) ctx.update( ctx.millis, ctx.dt, ctx.now );
        if ( ctx.autoclear ) ctx.clear();
        if ( ctx.draw ) ctx.draw( ctx );

        timeout = requestAnimationFrame( update );
    }

    function resize( event ) {

        if ( ctx.fullscreen ) {

            ctx.height = ctx.canvas.height = window.innerHeight;
            ctx.width = ctx.canvas.width = window.innerWidth;

        } else {

            ctx.canvas.height = ctx.height;
            ctx.canvas.width = ctx.width;
        }

        if ( ctx.resize ) ctx.resize();
    }

    // ----------------------------------------
    // Public API
    // ----------------------------------------

    return {

        CANVAS: CANVAS,
        WEB_GL: WEB_GL,

        create: create
    };

})();