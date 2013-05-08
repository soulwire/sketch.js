/*global module:false*/
module.exports = function(grunt) {

	"use strict";
	
	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		min: {
			dist: {
			src: ['<banner:meta.banner>', 'js/<%= pkg.name %>.js'],
				dest: 'js/<%= pkg.name %>.min.js'
			}
		},
		uglify: {}
	});

	// Default task.
	grunt.registerTask('default', 'min');

};
