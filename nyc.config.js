'use strict';

module.exports = {
  require: ['ts-node/register'],
  include: ['src', 'scripts'],
  all: true,
  exclude: ['coverage', 'test', 'example'],
  reporter: ['html', 'lcov', 'text'],
  'report-dir': 'coverage',
  'check-coverage': 'true',
  statements: 39,
  branches: 49,
  functions: 42,
  lines: 39
};
