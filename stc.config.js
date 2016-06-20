var stc = require('stc');
var babel = require('stc-babel');
var ts = require('stc-typescript');
var uglify = require('stc-uglify');
var eslint = require('stc-eslint');

stc.config({
  workers: 4,
  cluster: true,
  cache: false,
  include: ['template/', 'resource/'],
  tpl: {
    engine: 'smarty',
    extname: 'tpl',
    ld: '{%',
    rd: '%}'
  }
});

stc.lint({
  eslint: {plugin: eslint, include: 'resource/js/a.js'}
});

stc.transpile({
  babel: {plugin: babel, include: /src\/.*?\.js$/},
  ts: {plugin: ts, include: /src\/.*?\.ts/}
})

stc.workflow({
  JSCompress: {plugin: uglify, include: /\.js$/},
});

stc.start();