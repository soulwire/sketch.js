
function simulate(element, eventName) {

    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers) {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent) {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        } else {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    } else {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
};

var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
};

describe( 'create', function() {

    var sketch;

    afterEach(function() {
        while( Sketch.instances.length ) {
            Sketch.instances[0].destroy();
        }
    });

    // create

    it( 'create', function() {
        sketch = Sketch.create();
    });

    // install globals

    it( 'install globals', function() {

        sketch = Sketch.create();

        expect( sin( PI ) ).toBe( Math.sin( Math.PI ) );
    });

    // create without globals

    it( 'create without globals', function() {

        delete self[ '__hasSketch' ];
        delete self[ 'PI' ];

        sketch = Sketch.create({
            globals: false
        });

        expect( self.PI ).toBeUndefined();
    });

    // install to custom context

    it( 'install to custom context', function() {

        var context = {};

        sketch = Sketch.install( context );

        expect( context.sin( context.PI ) ).toBe( Math.sin( Math.PI ) );
    });

    // create without options

    it( 'create without options', function() {

        sketch = Sketch.create();
        expect( sketch.type ).not.toBeUndefined();
        expect( sketch.type ).toBe( Sketch.CANVAS );
    });

    // create with type CANVAS

    it( 'create with type CANVAS', function() {

        sketch = Sketch.create({ type: Sketch.CANVAS });
        expect( sketch instanceof CanvasRenderingContext2D ).toBe( true );
    });

    // create with type WEBGL

    it( 'create with type WEBGL', function() {

        sketch = Sketch.create({ type: Sketch.WEBGL });
        expect( sketch instanceof WebGLRenderingContext ).toBe( true );
    });

    // create with type DOM

    it( 'create with type DOM', function() {

        sketch = Sketch.create({ type: Sketch.DOM });
        expect( sketch instanceof HTMLDivElement ).toBe( true );
    });

    // create with existing element

    it( 'create with existing element', function() {

        var canvas = document.createElement( 'canvas' );

        sketch = Sketch.create({ element: canvas });

        expect( sketch.canvas ).toBe( sketch.element );
        expect( sketch.canvas ).toBe( canvas );
    });

    // augment existing context

    it( 'augment existing context', function() {

        var context = document.createElement( 'canvas' ).getContext( '2d' );

        sketch = Sketch.augment( context );

        expect( typeof context.start ).toBe( 'function' );
    });

});

describe( 'setup and teardown', function() {

    var sketch;

    afterEach(function() {
        while( Sketch.instances.length ) {
            Sketch.instances[0].destroy();
        }
    });

    // setup appends element to container

    it( 'setup appends element to container', function() {

        var container = document.createElement( 'div' );

        sketch = Sketch.create({
            container: container
        });

        expect( sketch.element.parentNode ).not.toBeUndefined();
        expect( sketch.element.parentNode ).toBe( container );
        expect( sketch.container ).toBe( container );
    });

    // setup and update

    it( 'setup and update', function() {

        var setup = false;
        var updated = false;

        sketch = Sketch.create({
            setup: function() {
                setup = true;
            },
            update: function() {
                updated = true;
            }
        });

        waitsFor( function() { return setup && updated; }, 'Setup and update never fired', 1000 );

        runs(function() {
            expect( setup ).toBe( true );
            expect( updated ).toBe( true );
        });
    });

    // setup and update (alternative syntax)

    it( 'setup and update (alternative syntax)', function() {

        var setup = false;
        var updated = false;

        sketch = Sketch.create();

        sketch.setup = function() {
            setup = true;
        };

        sketch.update = function() {
            updated = true;
        };

        waitsFor( function() { return setup && updated; }, 'Setup and update never fired', 1000 );

        runs(function() {
            expect( setup ).toBe( true );
            expect( updated ).toBe( true );
        });
    });

    // setup and update run correctly

    it( 'setup and update run correctly', function() {

        var setups = 0;
        var updates = 0;

        sketch = Sketch.create({
            setup: function() { setups++; },
            update: function() { updates++; }
        });

        for ( var i = 0; i < 100; i++ ) sketch.start();

        expect( setups ).toBe( 1 );
        expect( updates ).toBe( 1 );

        waitsFor( function() { return updates > 1; }, 'Update failed', 10000 );

        runs( function() {
            expect( updates ).toBeGreaterThan( 1 );
        });
    });

    // autostart false runs setup but not update

    it( 'autostart false runs setup but not update', function() {

        var setup = false;
        var updated = false;

        sketch = Sketch.create({
            autostart: false,
            setup: function() { setup = true; },
            update: function() { updated = true; }
        });

        runs( function() {
            expect( setup ).toBe( true );
            expect( updated ).toBe( false );
        });

        runs( sketch.start );

        waitsFor( function() { return updated; }, 'Update failed', 10000 );

        runs( function() {
            expect( updated ).toBe( true );
        });
    });

    // start, stop and toggle update loop

    it( 'start, stop and toggle update loop', function() {

        var count, updates = 0;

        sketch = Sketch.create({
            update: function() { updates++; }
        });

        waitsFor( function() { return updates > 0; }, 'Update failed', 10000 );

        runs( sketch.stop );

        runs( function() {
            expect( updates ).toBe( 1 );
        });

        runs( sketch.start );

        waitsFor( function() { return updates > 1; }, 'Update failed', 10000 );

        runs( function() {
            expect( updates ).toBeGreaterThan( 1 );
        });

        runs( function() {
            count = updates;
            sketch.toggle();
        });

        waits( 1000 );

        runs( function() {
            expect( updates ).toBe( count );
        });

        runs( sketch.toggle );

        waitsFor( function() { return updates > count; }, 'Update failed', 10000 );

        runs( function() {
            expect( updates ).toBeGreaterThan( count );
        });
    });

    // clock is working

    it( 'clock is working', function() {

        var clock = +new Date();
        var millis = 0;
        var MOE = 5;

        sketch = Sketch.create({
            update: function() {

                var now = +new Date();
                var dt = now - clock;
                millis += dt;

                expect( Math.abs( this.millis - millis ) ).toBeLessThan( MOE );
                expect( Math.abs( this.now - now ) ).toBeLessThan( MOE );
                expect( Math.abs( this.dt - dt ) ).toBeLessThan( MOE );

                clock = now;
            }
        });

        waits( 1000 );
    });

    // delta times ok after stop/start

    it( 'delta times ok after stop/start', function() {

        var updates = 0;

        sketch = Sketch.create({
            update: function() {
                updates++;
            }
        });

        waitsFor( function() { return updates > 1; }, 'Update never fired', 1000 );
        runs( sketch.stop );
        waits( 500 );
        runs( sketch.start );
        waitsFor( function() { return updates > 2; }, 'Update never fired after restart', 1000 );
        expect( sketch.dt ).toBeLessThan( 100 );
    });

    // interval is working

    it( 'interval is working', function() {

        var average1 = 0;
        var average2 = 0;

        var frames1 = 0;
        var frames2 = 0;

        Sketch.create({
            interval: 1,
            update: function() {
                average1 += this.dt;
                frames1++;
            }
        });

        Sketch.create({
            interval: 2,
            update: function() {
                average2 += this.dt;
                frames2++;
            }
        });

        waits( 500 );

        runs(function() {
            average1 /= frames1;
            average2 /= frames2;
            expect( Math.round( average2 / average1 ) ).toBe( 2 );
        });
    });

    // has correct dimensions during setup (canvas)

    it( 'has correct dimensions during setup (canvas)', function() {

        sketch = Sketch.create({
            type: Sketch.CANVAS,
            fullscreen: true
        });

        var bounds = sketch.element.getBoundingClientRect();
        expect( sketch.width ).toBe( window.innerWidth );
        expect( sketch.height ).toBe( window.innerHeight );
        expect( bounds.width ).toBe( window.innerWidth );
        expect( bounds.height ).toBe( window.innerHeight );
    });

    // has correct dimensions during setup (webgl)

    it( 'has correct dimensions during setup (webgl)', function() {

        sketch = Sketch.create({
            type: Sketch.WEBGL,
            fullscreen: true
        });

        var bounds = sketch.element.getBoundingClientRect();
        expect( sketch.width ).toBe( window.innerWidth );
        expect( sketch.height ).toBe( window.innerHeight );
        expect( bounds.width ).toBe( window.innerWidth );
        expect( bounds.height ).toBe( window.innerHeight );
    });

    // has correct dimensions during setup (DOM)

    it( 'has correct dimensions during setup (DOM)', function() {

        sketch = Sketch.create({
            type: Sketch.DOM,
            fullscreen: true
        });

        var bounds = sketch.element.getBoundingClientRect();
        expect( sketch.width ).toBe( window.innerWidth );
        expect( sketch.height ).toBe( window.innerHeight );
        expect( bounds.width ).toBe( window.innerWidth );
        expect( bounds.height ).toBe( window.innerHeight );
    });

    // retina dimensions are correct

    it( 'retina dimensions are correct', function() {

        var ratio = window.devicePixelRatio || 1;

        sketch = Sketch.create({
            retina: true
        });

        expect( sketch.retina ).toBe( true );
        expect( sketch.canvas.width ).toBe( sketch.width * ratio );
        expect( sketch.canvas.height ).toBe( sketch.height * ratio );
    });

    // resize fires after setup

    it( 'resize fires after setup', function() {

        var setup = false;
        var resized = false;

        sketch = Sketch.create({
            setup: function() {
                expect( resized ).toBe( false );
                setup = true;
            },
            resize: function() {
                expect( setup ).toBe( true );
                resized = true;
            }
        });

        expect( setup ).toBe( true );
        expect( resized ).toBe( true );
    });

    // custom size

    it( 'custom size', function() {

        var height = 600;
        var width = 800;

        sketch = Sketch.create({
            fullscreen: false,
            height: height,
            width: width,
            setup: function() {
                expect( this.height ).toBe( height );
                expect( this.width ).toBe( width );
            },
            resize: function() {
                expect( this.height ).toBe( height );
                expect( this.width ).toBe( width );
            }
        });

        expect( sketch.height ).toBe( height );
        expect( sketch.width ).toBe( width );
    });

    // destroy

    it( 'destroy', function() {

        var updates = 0;

        sketch = Sketch.create({
            update: function() { updates++; }
        });
        sketch.destroy();

        expect( sketch.element.parentNode ).toBe( null );
        expect( updates ).toBeLessThan( 2 );
    });

});

describe( 'events', function() {

    var sketch;

    afterEach(function() {
        if ( sketch ) sketch.destroy();
        sketch = null;
    });

    // mousedown

    it( 'mousedown', function() {

        var mousedown = false;
        var x = ~~( Math.random() * 100 );
        var y = ~~( Math.random() * 100 );

        sketch = Sketch.create({
            mousedown: function() {
                mousedown = true;
            }
        });

        var bounds = sketch.canvas.getBoundingClientRect();

        simulate( sketch.canvas, 'mousedown', {
            pointerX: x + bounds.left,
            pointerY: y + bounds.top
        });

        expect( sketch.touches[0].x ).toBe( x );
        expect( sketch.touches[0].y ).toBe( y );
        expect( sketch.mouse.x ).toBe( x );
        expect( sketch.mouse.y ).toBe( y );
        expect( mousedown ).toBe( true );
    });

    // mouseup

    it( 'mouseup', function() {

        var mouseup = false;
        var x = ~~( Math.random() * 100 );
        var y = ~~( Math.random() * 100 );

        sketch = Sketch.create({
            mouseup: function() {
                mouseup = true;
            }
        });

        var bounds = sketch.canvas.getBoundingClientRect();

        simulate( sketch.canvas, 'mouseup', {
            pointerX: x + bounds.left,
            pointerY: y + bounds.top
        });

        expect( sketch.touches[0].x ).toBe( x );
        expect( sketch.touches[0].y ).toBe( y );
        expect( sketch.mouse.x ).toBe( x );
        expect( sketch.mouse.y ).toBe( y );
        expect( mouseup ).toBe( true );
    });

    // click

    it( 'click', function() {

        var click = false;
        var x = ~~( Math.random() * 100 );
        var y = ~~( Math.random() * 100 );

        sketch = Sketch.create({
            click: function() {
                click = true;
            }
        });

        var bounds = sketch.canvas.getBoundingClientRect();

        simulate( sketch.canvas, 'click', {
            pointerX: x + bounds.left,
            pointerY: y + bounds.top
        });

        expect( sketch.touches[0].x ).toBe( x );
        expect( sketch.touches[0].y ).toBe( y );
        expect( sketch.mouse.x ).toBe( x );
        expect( sketch.mouse.y ).toBe( y );
        expect( click ).toBe( true );
    });

    // mousemove

    it( 'mousemove', function() {

        var x1 = ~~( Math.random() * 150 );
        var y1 = ~~( Math.random() * 150 );
        var x2 = ~~( Math.random() * 150 );
        var y2 = ~~( Math.random() * 150 );
        var events = 0;

        sketch = Sketch.create({
            mousemove: function( event ) {
                events++;
            }
        });

        var bounds = sketch.canvas.getBoundingClientRect();

        simulate( sketch.canvas, 'mousemove', {
            pointerX: x1 + bounds.left,
            pointerY: y1 + bounds.top
        });

        expect( sketch.mouse.x ).toBe( x1 );
        expect( sketch.mouse.y ).toBe( y1 );
        expect( sketch.touches.length ).toBe( 1 );
        expect( sketch.touches[0].x ).toBe( x1 );
        expect( sketch.touches[0].y ).toBe( y1 );
        expect( events ).toBe( 1 );

        simulate( sketch.canvas, 'mousemove', {
            pointerX: x2 + bounds.left,
            pointerY: y2 + bounds.top
        });

        expect( sketch.mouse.x ).toBe( x2 );
        expect( sketch.mouse.y ).toBe( y2 );
        expect( sketch.mouse.ox ).toBe( x1 );
        expect( sketch.mouse.oy ).toBe( y1 );
        expect( sketch.mouse.dx ).toBe( x2 - x1 );
        expect( sketch.mouse.dy ).toBe( y2 - y1 );
        expect( sketch.touches.length ).toBe( 1 );
        expect( sketch.touches[0].x ).toBe( x2 );
        expect( sketch.touches[0].y ).toBe( y2 );
        expect( sketch.touches[0].ox ).toBe( x1 );
        expect( sketch.touches[0].oy ).toBe( y1 );
        expect( sketch.touches[0].dx ).toBe( x2 - x1 );
        expect( sketch.touches[0].dy ).toBe( y2 - y1 );
        expect( events ).toBe( 2 );

    });

    // dragging

    it( 'dragging', function() {

        sketch = Sketch.create();

        expect( sketch.dragging ).toBe( false );

        simulate( sketch.canvas, 'mousedown' );
        simulate( sketch.canvas, 'mousemove' );

        expect( sketch.dragging ).toBe( true );

        simulate( sketch.canvas, 'mouseup' );

        expect( sketch.dragging ).toBe( false );
    });

});