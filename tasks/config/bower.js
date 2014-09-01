/**
 * Bower
 */
module.exports = function(grunt) {

    grunt.config.set('bower', {
        dev: {
            options: {
                targetDir: 'assets',
                layout: 'byType',
                install: true,
                verbose: false,
                cleanTargetDir: false,
                cleanBowerDir: false,
                copy:true,
                bowerOptions: {}
            }
        }
    });

    grunt.loadNpmTasks('grunt-bower-task');
};