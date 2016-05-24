var grunt = require('grunt');


var config = {
  jshint: {
    all: ['*.js']
  },
  mochaTest: {
    test: {
      options: {
        reporter: 'spec',
        timeout: 250000 // some tests download bower deps 
      },
      src: ['test/spec/**/*.js']
    }
  }
};

  require('load-grunt-tasks')(grunt);
  
  grunt.initConfig(config);
  grunt.registerTask('test', 'mochaTest');
  grunt.registerTask('dev', ['flow', 'watch']);
