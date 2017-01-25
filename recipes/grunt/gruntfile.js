// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const PWMetrics = require('../../lib/');

module.exports = function(grunt) {

  grunt.file.setBase('../../');

  grunt.initConfig({
    connect: {
      server: {
        options: {
          port: 8080,
          base: 'recipes/public'
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('pwmetrics', function() {
    grunt.event.once('connect.server.listening', (host, port) => {
      const url = `http://${host}:${port}/index.html`;
      const pwMetrics = new PWMetrics(url, {
        flags: {
          expectations: true
        },
        expectations: {
          metrics: {
            ttfcp: {
              warn: '>=3000',
              error: '>=5000'
            },
            ttfmp: {
              warn: '>=300',
              error: '>=50'
            },
            psi: {
              warn: '>=1500',
              error: '>=3200'
            }
          }
        }
      });
      pwMetrics.start()
        .then(this.async())
        .catch(_ => grunt.fatal(error));
    });
  });

  grunt.registerTask('default', ['pwmetrics', 'connect:server:keepalive']);
};
