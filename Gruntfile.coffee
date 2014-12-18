module.exports = (grunt) ->
  grunt.initConfig {

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

  grunt.registerTask('default', [
    'coffee',
    'less',
    'uglify'
  ])