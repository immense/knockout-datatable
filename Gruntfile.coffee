module.exports = (grunt) ->
  grunt.initConfig {

    karma:
      unit:
        frameworks: ['mocha', 'chai-sinon']
        browsers: [
          'Chrome'
          'Firefox'
        ]
        plugins: [
          'karma-mocha' # Use mocha for test organization
          'karma-mocha-reporter' # Use mocha style of reporting
          'karma-chai-sinon' # Use chai/sinon for testing helpers
          'karma-firefox-launcher'
          'karma-chrome-launcher'
        ]
        files: [
          # Require DataTable & it's dependencies
          {src: 'bower_components/knockout/dist/knockout.js'}
          {src: 'knockout-datatable.js'}

          # Require our tests
          {src: 'test/**/*.js'}
        ]
        reporters: ['mocha']
        # reporters: 'dots'
        # runnerPort: 9999
        # singleRun: true
        # logLevel: 'ERROR'

    # compile coffeescript files
    coffee:
      datatable:
        files:
          'knockout-datatable.js': 'knockout-datatable.coffee'

    # compile less files
    less:
      datatable:
        options:
          compress: true
        files:
          'knockout-datatable.css': 'knockout-datatable.less'

    # uglifyjs files
    uglify:
      datatable:
        options:
            sourceMap: true,

        src: 'knockout-datatable.js'
        dest: 'knockout-datatable.min.js'
  }

  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-karma'

  grunt.registerTask('test', ['karma'])

  grunt.registerTask('default', [
    'coffee',
    'less',
    'uglify'
  ])
