
var WEBGLU = {

	shaderProgram: function( gl, vs, fs ) {

		var program = gl.createProgram();
		var addshader = function( type, source ) {

			var shader = gl.createShader( type === 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER );
			gl.shaderSource( shader, source );
			gl.compileShader( shader );
			gl.attachShader( program, shader );
		};

		addshader( 'vertex', vs );
		addshader( 'fragment', fs );
		gl.linkProgram( program );

		return program;
	}
};

var example = new Sketch({

	VERTEX_SHADER: 'attribute vec3 pos; void main() { gl_Position = vec4(pos, 2.0); }',
	FRAGMENT_SHADER: 'void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }',

	container: document.getElementById( 'container' ),
	type: Sketch.WEB_GL,

	setup: function() {

		this.shaderProgram = WEBGLU.shaderProgram( this.gl, this.VERTEX_SHADER, this.FRAGMENT_SHADER );
		this.gl.useProgram( this.shaderProgram );
	},

	draw: function( gl ) {

		var vertices = [ -1, 0, 0,   0, 1, 0,   0, -1, 0,   1, 0, 0 ];

		gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

		var pos = gl.getAttribLocation( this.shaderProgram, 'pos' );
		gl.enableVertexAttribArray( pos );
		gl.vertexAttribPointer( pos, 3, gl.FLOAT, false, 0, 0 );

		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	},

	resize: function( width, height ) {
		this.gl.viewport( 0, 0, width, height );
	}
});