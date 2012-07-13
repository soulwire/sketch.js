
/**
 * --------------------------------------------------
 *
 *  Particle
 *
 * --------------------------------------------------
 */

function Particle( x, y, radius ) {
	this.init( x, y, radius );
}

Particle.prototype = {

	init: function( x, y, radius ) {

		this.alive = true;

		this.radius = radius || 10;
		this.wander = 0.15;
		this.theta = random( TWO_PI );
		this.drag = 0.92;
		this.color = '#fff';

		this.x = x || 0.0;
		this.y = y || 0.0;

		this.vx = 0.0;
		this.vy = 0.0;
	},

	move: function( dt ) {

		this.x += this.vx;
		this.y += this.vy;

		this.vx *= this.drag;
		this.vy *= this.drag;

		this.theta += random( -0.5, 0.5 ) * this.wander;
		this.vx += sin( this.theta ) * 0.1;
		this.vy += cos( this.theta ) * 0.1;

		this.radius *= 0.96;
		this.alive = this.radius > 0.5;
	},

	draw: function( ctx ) {

		ctx.beginPath();
		ctx.arc( this.x, this.y, this.radius, 0, TWO_PI );
		ctx.fillStyle = this.color;
		ctx.fill();
	}
};

/**
 * --------------------------------------------------
 *
 *  Example Sketch
 *
 * --------------------------------------------------
 */

var example = new Sketch({

	// Config

	MAX_PARTICLES: 280,
	COLOURS: [ '#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423' ],

	// Settings

	container: document.getElementById( 'container' ),
	type: Sketch.CANVAS,
	stats: true,

	// Methods

	setup: function() {

		this.particles = [];
		this.pool = [];

		// Set off some initial particles.
		var i, x, y;

		for ( i = 0; i < 20; i++ ) {
			x = (this.width * 0.5) + random( -100, 100 );
			y = (this.height * 0.5) + random( -100, 100 );
			this.spawn( x, y );
		}
	},

	draw: function( ctx, dt ) {

		var i, particle;

		this.ctx.globalCompositeOperation  = 'lighter';

		for ( i = this.particles.length - 1; i >= 0; i-- ) {

			particle = this.particles[i];

			if ( particle.alive ) {

				particle.move( dt );
				particle.draw( ctx );

			} else {

				this.particles.splice( i, 1 );
				this.pool.push( particle );
			}
		}
	},

	spawn: function( x, y ) {

		if ( this.particles.length >= this.MAX_PARTICLES ) {
			this.pool.push( this.particles.shift() );
		}

		particle = this.pool.length ? this.pool.pop() : new Particle();
		particle.init( x, y, random( 5, 40 ) );

		particle.wander = random( 0.5, 2.0 );
		particle.color = random( this.COLOURS );
		particle.drag = random( 0.9, 0.99 );

		theta = random( TWO_PI );
		force = random( 2, 8 );

		particle.vx = sin( theta ) * force;
		particle.vy = cos( theta ) * force;

		this.particles.push( particle );
	},

	mousemove: function() {

		var particle, theta, force, touch, max, i, j, n;

		// You can use touches to access non-multitouch mousemove.
		for ( i = 0, n = this.touches.length; i < n; i++ ) {

			touch = this.touches[i], max = random( 1, 4 );

			for ( j = 0; j < max; j++ ) {

				this.spawn( touch.x, touch.y );
			}
		}
	},

	keydown: function() {
		console.log( 'key pressed: ' + this.key );
	}
});
